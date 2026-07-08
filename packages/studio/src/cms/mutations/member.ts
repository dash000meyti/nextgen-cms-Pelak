"use server";

import { invalidateMember, invalidateMembers } from "@nextgen-cms/config/cache";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import {
  findMemberById,
  memberEmailExists,
  memberUsernameExists,
  setMemberPassword,
  updateMemberEmail,
  updateMemberPersonal,
  updateMemberUsername,
} from "@nextgen-cms/core/db/repositories/members";
import type { MemberAdminWriteInput } from "@nextgen-cms/core/db/repositories/members-admin";
import {
  deactivateOrRemoveMember,
  findMemberForAdmin,
  insertMemberAdmin,
  updateMemberAdmin,
} from "@nextgen-cms/core/db/repositories/members-admin";
import { findRoleById } from "@nextgen-cms/core/db/repositories/roles";
import { memberAvatarPath } from "@nextgen-cms/core/media/path-policy";
import { promoteMediaToFolder } from "@nextgen-cms/core/media/promote-media";
import { permissionDeniedResult } from "@nextgen-cms/studio/admin/article-access";
import {
  assertCanAssignRole,
  assertCanChangeOwnRole,
} from "@nextgen-cms/studio/admin/member-access";
import { requireMember } from "@nextgen-cms/studio/admin/require-member";
import { requirePermissionMutation } from "@nextgen-cms/studio/admin/require-permission";
import type { MutationResult } from "@nextgen-cms/studio/cms/mutations/require-admin";
import { assertUniqueSlug } from "@nextgen-cms/studio/cms/queries/slug";
import {
  normalizeSlugInput,
  validateImageMeta,
  validateRequired,
  validateSlug,
} from "@nextgen-cms/studio/cms/validation";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export type MemberCredentialsInput = {
  username?: string;
  email?: string;
  password?: string;
};

export type PersonalSettingsInput = {
  name: string;
  username?: string;
  email?: string;
  password?: string;
  bio: string;
  avatarSrc: string;
  avatarAlt: string;
};

export type MemberFormData = {
  slug: string;
  name: string;
  username: string;
  displayRole: string;
  bio: string;
  avatarSrc: string;
  avatarAlt: string;
  socialTwitter: string;
  socialTelegram: string;
  socialInstagram: string;
  email: string;
  password: string;
  roleId: number;
  isActive: boolean;
};

const MIN_PASSWORD_LENGTH = 8;

function access(memberId: number) {
  return { memberId };
}

function handleMutationError(error: unknown): MutationResult {
  if (error instanceof PermissionDeniedError) {
    return permissionDeniedResult();
  }
  throw error;
}

function parseFormData(
  data: MemberFormData,
): Omit<MemberAdminWriteInput, "passwordHash"> & { password?: string } {
  return {
    slug: normalizeSlugInput(data.slug),
    name: data.name.trim(),
    username: data.username.trim(),
    displayRole: data.displayRole.trim(),
    bio: data.bio.trim(),
    avatarSrc: data.avatarSrc.trim(),
    avatarAlt: data.avatarAlt.trim(),
    socialTwitter: data.socialTwitter.trim() || null,
    socialTelegram: data.socialTelegram.trim() || null,
    socialInstagram: data.socialInstagram.trim() || null,
    email: data.email.trim() || null,
    password: data.password.trim() || undefined,
    roleId: data.roleId,
    isActive: data.isActive,
  };
}

async function validateMemberInput(
  input: Omit<MemberAdminWriteInput, "passwordHash"> & { password?: string },
  options: { mode: "create" | "edit"; excludeId?: number },
): Promise<string | undefined> {
  const nameError = validateRequired(input.name, "نام");
  if (nameError) return nameError;

  const usernameError = validateRequired(input.username, "نام کاربری");
  if (usernameError) return usernameError;
  if (await memberUsernameExists(input.username, options.excludeId)) {
    return "این نام کاربری قبلاً ثبت شده است.";
  }

  const slugError = validateSlug(input.slug);
  if (slugError) return slugError;

  const uniqueError = await assertUniqueSlug(
    "member",
    input.slug,
    options.excludeId,
  );
  if (uniqueError) return uniqueError;

  const avatarError = validateImageMeta(
    input.avatarSrc,
    input.avatarAlt,
    "تصویر",
  );
  if (avatarError) return avatarError;

  if (input.email) {
    if (await memberEmailExists(input.email, options.excludeId)) {
      return "این ایمیل قبلاً ثبت شده است.";
    }
  }

  if (input.password && input.password.length < MIN_PASSWORD_LENGTH) {
    return "رمز عبور باید حداقل ۸ کاراکتر باشد.";
  }

  const role = await findRoleById(input.roleId);
  if (!role) return "نقش انتخاب‌شده معتبر نیست.";

  return undefined;
}

async function invalidateAfterSave(slug: string, previousSlug?: string) {
  invalidateMembers();
  invalidateMember(slug);
  if (previousSlug && previousSlug !== slug) {
    invalidateMember(previousSlug);
  }
}

async function buildWriteInput(
  parsed: Omit<MemberAdminWriteInput, "passwordHash"> & { password?: string },
): Promise<MemberAdminWriteInput> {
  let passwordHash: string | null = null;
  if (parsed.password) {
    passwordHash = await bcrypt.hash(parsed.password, 12);
  }

  return {
    username: parsed.username,
    email: parsed.email,
    passwordHash,
    slug: parsed.slug,
    name: parsed.name,
    displayRole: parsed.displayRole,
    bio: parsed.bio,
    avatarSrc: parsed.avatarSrc,
    avatarAlt: parsed.avatarAlt,
    socialTwitter: parsed.socialTwitter,
    socialTelegram: parsed.socialTelegram,
    socialInstagram: parsed.socialInstagram,
    roleId: parsed.roleId,
    isActive: parsed.isActive,
  };
}

export async function updateMemberCredentials(
  memberId: number,
  input: MemberCredentialsInput,
): Promise<MutationResult> {
  const session = await requireMember();
  const isSuperAdmin = session.role.slug === "super_admin";
  const isSelf = session.memberId === memberId;

  const username = input.username?.trim();
  const email = input.email?.trim();
  const password = input.password;

  if (!username && !email && !password) {
    return {
      ok: false,
      error: "حداقل یکی از نام کاربری، ایمیل یا رمز عبور را وارد کنید.",
    };
  }

  if ((username || email) && !isSuperAdmin && !isSelf) {
    return permissionDeniedResult();
  }

  if (password && !isSuperAdmin && !isSelf) {
    return permissionDeniedResult();
  }

  const member = await findMemberById(memberId);
  if (!member) {
    return { ok: false, error: "عضو یافت نشد." };
  }

  if (username) {
    if (await memberUsernameExists(username, memberId)) {
      return { ok: false, error: "این نام کاربری قبلاً ثبت شده است." };
    }
    await updateMemberUsername(memberId, username);
  }

  if (email) {
    if (await memberEmailExists(email, memberId)) {
      return { ok: false, error: "این ایمیل قبلاً ثبت شده است." };
    }
    await updateMemberEmail(memberId, email);
  }

  if (password) {
    if (password.length < MIN_PASSWORD_LENGTH) {
      return {
        ok: false,
        error: "رمز عبور باید حداقل ۸ کاراکتر باشد.",
      };
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await setMemberPassword(memberId, passwordHash);
  }

  return { ok: true, id: memberId };
}

export async function savePersonalSettings(
  input: PersonalSettingsInput,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("settings.personal");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const name = input.name.trim();
  const username = input.username?.trim();
  const email = input.email?.trim();
  const password = input.password;
  const bio = input.bio.trim();
  const avatarSrc = input.avatarSrc.trim();
  const avatarAlt = input.avatarAlt.trim();

  const nameError = validateRequired(name, "نام");
  if (nameError) return { ok: false, error: nameError };

  const avatarError = validateImageMeta(avatarSrc, avatarAlt, "آواتار");
  if (avatarError) return { ok: false, error: avatarError };

  const member = await findMemberById(session.memberId);
  if (!member) {
    return { ok: false, error: "عضو یافت نشد." };
  }

  if (username && username !== member.username) {
    if (await memberUsernameExists(username, session.memberId)) {
      return { ok: false, error: "این نام کاربری قبلاً ثبت شده است." };
    }
    await updateMemberUsername(session.memberId, username);
  }

  if (email && email !== member.email) {
    if (await memberEmailExists(email, session.memberId)) {
      return { ok: false, error: "این ایمیل قبلاً ثبت شده است." };
    }
    await updateMemberEmail(session.memberId, email);
  }

  if (password) {
    if (password.length < MIN_PASSWORD_LENGTH) {
      return {
        ok: false,
        error: "رمز عبور باید حداقل ۸ کاراکتر باشد.",
      };
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await setMemberPassword(session.memberId, passwordHash);
  }

  const promotedAvatarSrc = await promoteMediaToFolder(
    avatarSrc,
    memberAvatarPath(session.memberId),
  );

  await updateMemberPersonal(session.memberId, {
    name,
    bio,
    avatarSrc: promotedAvatarSrc,
    avatarAlt,
  });

  return { ok: true, id: session.memberId };
}

export async function createMember(
  data: MemberFormData,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("members.create");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const parsed = parseFormData(data);
  const error = await validateMemberInput(parsed, { mode: "create" });
  if (error) return { ok: false, error };

  const role = await findRoleById(parsed.roleId);
  if (!role) return { ok: false, error: "نقش انتخاب‌شده معتبر نیست." };

  const roleDenied = assertCanAssignRole(session, role.slug);
  if (roleDenied) return roleDenied;

  const writeInput = await buildWriteInput(parsed);

  try {
    const id = await insertMemberAdmin(writeInput, access(session.memberId));
    const promotedAvatarSrc = await promoteMediaToFolder(
      writeInput.avatarSrc,
      memberAvatarPath(id),
    );
    if (promotedAvatarSrc !== writeInput.avatarSrc) {
      await updateMemberAdmin(
        id,
        { ...writeInput, avatarSrc: promotedAvatarSrc },
        access(session.memberId),
      );
    }
    await invalidateAfterSave(writeInput.slug);
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function saveMember(
  id: number,
  data: MemberFormData,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("members.edit");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const existing = await findMemberForAdmin(id, access(session.memberId));
  if (!existing) return { ok: false, error: "عضو یافت نشد." };

  const parsed = parseFormData(data);
  const error = await validateMemberInput(parsed, {
    mode: "edit",
    excludeId: id,
  });
  if (error) return { ok: false, error };

  const role = await findRoleById(parsed.roleId);
  if (!role) return { ok: false, error: "نقش انتخاب‌شده معتبر نیست." };

  const roleDenied = assertCanAssignRole(session, role.slug);
  if (roleDenied) return roleDenied;

  const selfRoleDenied = assertCanChangeOwnRole(session, id, role.slug);
  if (selfRoleDenied) return selfRoleDenied;

  if (parsed.username !== existing.username) {
    if (await memberUsernameExists(parsed.username, id)) {
      return { ok: false, error: "این نام کاربری قبلاً ثبت شده است." };
    }
  }

  if (parsed.email && parsed.email !== existing.email) {
    if (await memberEmailExists(parsed.email, id)) {
      return { ok: false, error: "این ایمیل قبلاً ثبت شده است." };
    }
  }

  const writeInput = await buildWriteInput(parsed);
  writeInput.avatarSrc = await promoteMediaToFolder(
    writeInput.avatarSrc,
    memberAvatarPath(id),
  );

  try {
    await updateMemberAdmin(id, writeInput, access(session.memberId));
    await invalidateAfterSave(writeInput.slug, existing.slug);
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function removeMember(id: number): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("members.delete");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const existing = await findMemberForAdmin(id, access(session.memberId));
  if (!existing) return { ok: false, error: "عضو یافت نشد." };

  if (id === session.memberId) {
    return { ok: false, error: "نمی‌توانید حساب خود را حذف کنید." };
  }

  try {
    await deactivateOrRemoveMember(id, access(session.memberId));
    await invalidateAfterSave(existing.slug);
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function createMemberAndRedirect(data: MemberFormData) {
  const result = await createMember(data);
  if (!result.ok) return result;
  redirect(`/admin/members/${result.id}/edit`);
}
