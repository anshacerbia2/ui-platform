// TDD packaging RC3: one version for both packages, a SemVer 2.0.0
// pre-release until a stable release is authorized, on the 2.0.0 line
// (STD-UIP-ENG-001 3.5 (3); ADR-UIP-REL-001 item 5: @scnx/core-ui@1.0.0
// already exists in the registry and a version is never reused).
const PRERELEASE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*)$/;

export const RELEASE_LINE = "2.0.0";

/** Findings for the versions of the packed manifests (`[{ name, version }]`). */
export function releaseVersionFindings(manifests) {
  const findings = [];
  const versions = new Set(manifests.map((m) => m.version));
  if (versions.size > 1) findings.push(`packages carry different versions (${manifests.map((m) => `${m.name}@${m.version}`).join(", ")}); RC3 requires one version`);
  for (const { name, version } of manifests) {
    if (!PRERELEASE.test(version ?? "")) findings.push(`${name}@${version}: not a SemVer pre-release; no stable release is authorized (RC3)`);
    else if (!version.startsWith(`${RELEASE_LINE}-`)) findings.push(`${name}@${version}: not on the ${RELEASE_LINE} pre-release line (RC3)`);
  }
  return findings;
}
