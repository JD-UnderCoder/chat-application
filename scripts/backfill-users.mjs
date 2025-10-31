import admin from "firebase-admin";

async function main() {
  try {
    if (!admin.apps.length) {
      const args = process.argv.slice(2);
      const projectIdx = args.findIndex((a) => a === "--project" || a === "-p");
      const projectIdArg = projectIdx !== -1 && args[projectIdx + 1] ? args[projectIdx + 1] : undefined;
      const projectId = process.env.FIREBASE_PROJECT_ID || projectIdArg;
      admin.initializeApp(projectId ? { projectId } : undefined);
    }
    const db = admin.firestore();

    // Backfill missing fields on users
    const usersCol = db.collection("users");
    const snap = await usersCol.get();
    let updated = 0;
    const batch = db.batch();

    snap.forEach((doc) => {
      const data = doc.data() || {};
      const displayName = (data.displayName || "").toString();
      const email = (data.email || "").toString();
      const needsName = !data.name || typeof data.name !== "string" || data.name.length === 0;
      const needsEmailLower = !data.emailLower || typeof data.emailLower !== "string" || data.emailLower.length === 0;
      if (needsName || needsEmailLower) {
        batch.set(
          doc.ref,
          {
            ...(needsName ? { name: displayName.toLowerCase() } : {}),
            ...(needsEmailLower ? { emailLower: email.toLowerCase() } : {}),
          },
          { merge: true }
        );
        updated += 1;
      }
    });

    if (updated > 0) {
      await batch.commit();
    }
    console.log(`Backfill complete: {count updated} = ${updated}`);

    // Re-run prefix query by emailLower for verification
    const args = process.argv.slice(2);
    const termArgIndex = args.findIndex((a) => a === "--term" || a === "-t");
    const term = termArgIndex !== -1 && args[termArgIndex + 1] ? args[termArgIndex + 1].toLowerCase() : "rishabh";
    const q = usersCol.orderBy("emailLower").startAt(term).endAt(term + "\uf8ff");
    const qsnap = await q.get();
    console.log(`Search snapshot {count} = ${qsnap.size}`);
    const preview = qsnap.docs.slice(0, 5).map((d) => ({ id: d.id, email: d.get("email"), displayName: d.get("displayName"), emailLower: d.get("emailLower"), name: d.get("name") }));
    console.log("Preview:", preview);
  } catch (err) {
    console.error("Backfill error:", err);
    process.exitCode = 1;
  }
}

main();
