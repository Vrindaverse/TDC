export type ProfileCompletionFields = {
  id: string;
  name: string;
  mobile: string;
  collegeId: string | null;
  enrollmentNumber: string;
  avatarKey: string | null;
};

export function calculateProfileCompletion(
  profile: ProfileCompletionFields
): number {
  let completed = 0;
  const totalFields = 6;

  if (profile.name) completed++;
  if (profile.mobile) completed++;
  if (profile.collegeId) completed++;
  if (profile.enrollmentNumber) completed++;
  if (profile.avatarKey) completed++;
  if (profile.id) completed++;

  return Math.round((completed / totalFields) * 100);
}
