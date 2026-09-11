import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const checks = [];
const assert = (name, condition) => checks.push({ name, ok: Boolean(condition) });

const tabs = read("src/features/navigation/MainTabsExperience.tsx");
const rootLayout = read("src/app/_layout.tsx");
const chat = read("src/features/chat/ChatInboxExperience.tsx");
const createGroup = read("src/features/groups/CreateGroupExperience.tsx");
const profile = read("src/features/profile/FigmaProfileExperience.tsx");
const friends = read("src/features/social/FigmaFriendsExperience.tsx");
const explore = read("src/features/discovery/FigmaExploreExperience.tsx");
const cover = read("src/features/profile/FigmaProfileExperience.tsx");
const notificationCenter = read("src/features/notifications/NotificationCenterExperience.tsx");
const invitesRoute = read("src/app/(main)/invites.tsx");
const venueState = read("src/utils/venue-state.ts");const groupDetail = read("src/features/groups/GroupDetailExperience.tsx");
const inviteToGroup = read("src/features/groups/InviteToGroupExperience.tsx");
const groupChat = read("src/features/groups/GroupChatExperience.tsx");
const chatInbox = read("src/features/chat/ChatInboxExperience.tsx");
const directChat = read("src/features/chat/DirectChatExperience.tsx");

assert("six primary tabs", ["home", "explore", "events", "friends", "chat", "profile"].every((key) => tabs.includes(`name="${key}"`)));
assert("groups is hidden from primary tab bar", /name="groups" options=\{\{ href: null \}\}/.test(tabs));
assert("chat plus opens create group", chat.includes("/(main)/group/create"));
assert("create group back targets chat", createGroup.includes('router.replace("/(main)/chat")'));
assert("profile Groups row is not rendered", profile.includes('if (label === "Grupos") return null'));
assert("profile cover is local", cover.includes("assets/images/profile-cover.jpg") && !cover.includes("images.unsplash.com"));
assert("friends row has sibling actions", friends.includes("<View style={styles.friend}") && friends.includes("Abrir perfil de"));
assert("explore title remains 22px", /title:\s*\{[^}]*fontSize:\s*22/.test(explore));
assert("notification center is not a primary tab", !/name="notification-center"/.test(tabs));assert("GroupDetail avoids legacy stores", !groupDetail.includes("useGroupStore") && !groupDetail.includes("useInviteStore"));
assert("GroupDetail imports social resources", groupDetail.includes("resources/groups") && groupDetail.includes("resources/friends") && groupDetail.includes("resources/invites"));
assert("InviteToGroup avoids legacy stores", !inviteToGroup.includes("useGroupStore") && !inviteToGroup.includes("useInviteStore"));
assert("InviteToGroup imports resources", inviteToGroup.includes("resources/groups") && inviteToGroup.includes("resources/friends") && inviteToGroup.includes("resources/invites"));
assert("GroupChat uses query metadata and chat store", !groupChat.includes("useGroupStore") && groupChat.includes("resources/groups") && groupChat.includes("chat-store"));
assert("ChatInbox uses social resources", !chatInbox.includes("useGroupStore") && chatInbox.includes("resources/groups") && chatInbox.includes("resources/friends"));
assert("DirectChat avoids legacy friend loader", !directChat.includes("getFriends(") && directChat.includes("resources/friends"));
assert("notification center is shell overlay only", !fs.existsSync(path.join(root, "src/app/notification-center.tsx")) && !fs.existsSync(path.join(root, "src/app/(main)/notification-center.tsx")) && tabs.includes("NotificationCenterExperience"));
assert("explore opens notification center overlay", explore.includes("openNotificationCenter()") && explore.includes("Abrir notificações"));
assert("legacy invites route redirects to explore", invitesRoute.includes("/(main)/explore"));
assert("notification preferences remain separate", read("src/app/(main)/notifications.tsx").includes("FigmaNotificationsExperience") && notificationCenter.includes("useReceivedInvitesQuery"));assert("active Friends uses React Query resource", friends.includes("useFriendsQuery") && !friends.includes("getFriends"));
assert("CreateGroup has no group store authority", !createGroup.includes("useGroupStore"));
assert("Notification Center split is explicit", notificationCenter.includes("useNotificationStore") && notificationCenter.includes("useReceivedInvitesQuery") && !notificationCenter.includes("useInviteStore"));
assert("notification center has no demo data", !["Lara", "Mateus", "Mariana F.", "Ricardo A.", "Clos Lounge", "Primavera Sound SP"].some((token) => notificationCenter.includes(token)));
assert("imported FSQ occupancy requires real capacity", venueState.includes("occupancyPercent") && venueState.includes("Number.isFinite(percentage)") && venueState.includes("Movimento indisponível"));
assert("imported FSQ availability is neutral", venueState.includes('venue.externalProvider === "FSQ_OS"') && venueState.includes("Horário indisponível"));
assert("manual occupancy labels remain available", venueState.includes("Cheio") && venueState.includes("Movimentado") && venueState.includes("Tranquilo"));
assert("occupancy uses API percent directly", venueState.includes("Number(venue.occupancyPercent)") && !venueState.includes("venue.occupancy)"));
assert("zero percent is known", venueState.includes("Number.isFinite(percentage)") && venueState.includes("percentage > 70"));
assert("over-capacity percent is preserved", venueState.includes("percentage }"));

for (const token of ["Clos Lounge", "Primavera Sound SP", "Lara", "Mateus", "Mariana F.", "Ricardo A.", "Parcels", "LCD Soundsystem"]) {
  const runtime = ["src/features", "src/components", "src/services", "src/store"]
    .flatMap((dir) => { const abs = path.join(root, dir); return fs.existsSync(abs) ? walk(abs) : []; })
    .filter((file) => /\.(tsx?|jsx?)$/.test(file) && !file.includes("figma-home-reference"))
    .some((file) => fs.readFileSync(file, "utf8").includes(token));
  assert(`no runtime demo: ${token}`, !runtime);
}

const failed = checks.filter((check) => !check.ok);
for (const check of checks) console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}`);
if (failed.length) process.exitCode = 1;
else console.log(`\n${checks.length} regression checks passed.`);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}