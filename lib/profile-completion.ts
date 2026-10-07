export type ProfileCompletionFields = {
  id: string;
  name: string;
  mobile: string;
  collegeId: string | null;
  enrollmentNumber: string;
  avatarKey: string | null;
  skills: string[] | null;
  bio: string | null;
};

export function calculateProfileCompletion(
  profile: ProfileCompletionFields
): number {
  let completed = 0;
  const totalFields = 7;

  if (profile.name) completed++;
  if (profile.mobile) completed++;
  if (profile.collegeId) completed++;
  if (profile.enrollmentNumber) completed++;
  if (profile.avatarKey) completed++;
  if (profile.skills && profile.skills.length > 0) completed++;
  if (profile.bio && profile.bio.trim().length > 0) completed++;

  return Math.round((completed / totalFields) * 100);
}
