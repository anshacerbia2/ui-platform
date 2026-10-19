// Entry stability (TDD primitives P13, lien L4), shared by the packed-artifact
// inspector (every pull request) and the evidence packet (every push to main).

/**
 * TDD primitives P13 (lien L4): every public JavaScript entry has exactly one
 * stability record, a PrimitiveContract or an EntryStability record.
 */
export function entryStability(packReport, inventory) {
  const failures = [];
  const records = [...inventory.primitives, ...(inventory.entries ?? [])];
  const byEntry = new Map();
  for (const record of records) {
    if (byEntry.has(record.entry)) failures.push(`${record.entry} has more than one stability record (P13)`);
    byEntry.set(record.entry, record.stability);
  }
  const publicEntries = packReport.packages.flatMap((pkg) => Object.keys(pkg.environments).map((subpath) => `${pkg.name}${subpath.slice(1)}`));
  const entries = publicEntries.map((entry) => {
    if (!byEntry.has(entry)) failures.push(`${entry} has no stability record (P13)`);
    return { entry, stability: byEntry.get(entry) ?? "unclassified" };
  });
  const published = new Set(publicEntries);
  for (const entry of byEntry.keys()) if (!published.has(entry)) failures.push(`${entry} has a stability record but is not a public entry (P13)`);
  return { entries, failures };
}
