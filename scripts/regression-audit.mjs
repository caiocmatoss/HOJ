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
const messagesResource = read("src/services/api/resources/messages.ts");
const confirmDelete = read("src/features/chat/confirmDelete.ts");
const contextActions = read("src/features/chat/MessageContextActions.tsx");
const socketService = read("src/services/socket.ts");
const apiClient = read("src/services/api/client.ts");
const authService = read("src/services/api/auth.ts");

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
assert("ChatInbox uses messaging resource", chatInbox.includes("resources/messages") && !chatInbox.includes("getDirectMessages") && !chatInbox.includes("getGroupMessages"));
assert("DirectChat uses messaging resource", directChat.includes("resources/messages") && !directChat.includes("getDirectMessages"));
assert("GroupChat uses messaging resource", groupChat.includes("resources/messages") && !groupChat.includes("getGroupMessages"));
assert("messaging resource uses apiClient", messagesResource.includes("apiClient") && messagesResource.includes("apiClientWithMeta"));
assert("messaging query keys are defined", read("src/services/api/query-keys.ts").includes("messageKeys") && messagesResource.includes("messageKeys"));
assert("socket client is singleton", socketService.includes("let socket: AppSocket | null = null") && socketService.includes("socket = io(") && (socketService.match(/socket = io\(/g) ?? []).length === 1);
assert("socket message listeners expose cleanup", /currentSocket\.off\([\s\S]{0,80}?"message:new"/.test(socketService) && /currentSocket\.off\([\s\S]{0,100}?"direct:message:new"/.test(socketService));
assert("realtime message updates target React Query", groupChat.includes("queryClient.setQueryData") && directChat.includes("queryClient.setQueryData"));
assert("realtime dedupe uses message ids", groupChat.includes("item.id !== message.id") && directChat.includes("item.id !== message.id"));
assert("no socket token logging", !socketService.includes("console.log(accessToken") && !socketService.includes("console.log(token"));
assert("refresh is single-flight", apiClient.includes("let refreshFlight") && apiClient.includes("if (!refreshFlight)") && apiClient.includes("refreshFlight = null"));
assert("refreshed token reauthenticates socket", apiClient.includes("reauthenticateSocket(result.accessToken)") && socketService.includes("export function reauthenticateSocket"));
assert("socket reauth preserves singleton", socketService.includes("socket.auth") && socketService.includes("socket.disconnect()") && socketService.includes("socket.connect()") && (socketService.match(/socket = io\(/g) ?? []).length === 1);
assert("logout invalidates refresh generation", authService.includes("beginSessionTermination()") && apiClient.includes("generationAtStart !== sessionGeneration"));
assert("refresh retries only once", apiClient.includes("retryOnUnauthorized: false") && apiClient.includes("!isAuthEndpoint(path)"));
assert("notification center is shell overlay only", !fs.existsSync(path.join(root, "src/app/notification-center.tsx")) && !fs.existsSync(path.join(root, "src/app/(main)/notification-center.tsx")) && tabs.includes("NotificationCenterExperience"));
assert("explore opens notification center overlay", explore.includes("openNotificationCenter()") && explore.includes("Abrir notificações"));
assert("legacy invites route redirects to explore", invitesRoute.includes("/(main)/explore"));
assert("notification preferences remain separate", read("src/app/(main)/notifications.tsx").includes("FigmaNotificationsExperience") && notificationCenter.includes("useReceivedInvitesQuery"));assert("active Friends uses React Query resource", friends.includes("useFriendsQuery") && !friends.includes("getFriends"));
assert("CreateGroup has no group store authority", !createGroup.includes("useGroupStore"));
assert("Notification Center uses notifications resource", notificationCenter.includes("resources/notifications") && notificationCenter.includes("useNotificationsQuery") && notificationCenter.includes("useReceivedInvitesQuery") && !notificationCenter.includes("useNotificationStore"));
assert("Notification Center unread count is backend-backed", notificationCenter.includes("useUnreadNotificationCountQuery"));
assert("Notification Center read mutation is backend-backed", notificationCenter.includes("useMarkNotificationReadMutation"));
assert("push device resource uses apiClient", read("src/services/api/resources/push-devices.ts").includes("apiClient") && read("src/services/api/resources/push-devices.ts").includes("/notifications/devices"));
assert("push registration is native guarded", read("src/services/push-device-registration.native.ts").includes("getExpoPushTokenAsync") && read("src/services/push-device-registration.web.ts").includes("registerPushDeviceIfEnabled"));
assert("notification center has no notification store authority", !notificationCenter.includes("useNotificationStore") && !notificationCenter.includes("loadNotifications"));
assert("notification center has no demo data", !["Lara", "Mateus", "Mariana F.", "Ricardo A.", "Clos Lounge", "Primavera Sound SP"].some((token) => notificationCenter.includes(token)));
assert("imported FSQ occupancy requires real capacity", venueState.includes("occupancyPercent") && venueState.includes("Number.isFinite(percentage)") && venueState.includes("Movimento indisponível"));
assert("imported FSQ availability is neutral", venueState.includes('venue.externalProvider === "FSQ_OS"') && venueState.includes("Horário indisponível"));
assert("manual occupancy labels remain available", venueState.includes("Cheio") && venueState.includes("Movimentado") && venueState.includes("Tranquilo"));
assert("occupancy uses API percent directly", venueState.includes("Number(venue.occupancyPercent)") && !venueState.includes("venue.occupancy)"));
assert("zero percent is known", venueState.includes("Number.isFinite(percentage)") && venueState.includes("percentage > 70"));
assert("over-capacity percent is preserved", venueState.includes("percentage }"));
assert("ChatInbox uses aggregated inbox query", chatInbox.includes("useChatInboxQuery") && chatInbox.includes("/messages/inbox") === false);
assert("ChatInbox does not fan out message history", !chatInbox.includes("useQueries") && !chatInbox.includes("listDirectMessages") && !chatInbox.includes("listGroupMessages"));
assert("messaging resource exposes unread count", messagesResource.includes("useChatUnreadCountQuery") && messagesResource.includes("/messages/unread/count"));
assert("messaging resource exposes mark-read", messagesResource.includes("useMarkChatReadMutation") && messagesResource.includes("/messages/read"));
assert("DirectChat marks direct thread read via API", directChat.includes("useMarkChatReadMutation") && directChat.includes('threadType: "DIRECT"'));
assert("GroupChat marks group thread read via API", groupChat.includes("useMarkChatReadMutation") && groupChat.includes('threadType: "GROUP"'));
assert("read state is not local unread authority", !chatInbox.includes("setUnread") && !directChat.includes("setUnread") && !groupChat.includes("setUnread"));
assert("message query keys include inbox and unread", read("src/services/api/query-keys.ts").includes("inbox:") && read("src/services/api/query-keys.ts").includes("unreadCount"));
assert("direct typing uses socket with cleanup", directChat.includes("emitDirectTyping") && directChat.includes("onDirectTyping") && directChat.includes("clearTimeout"));
assert("group typing uses socket with cleanup", groupChat.includes("emitGroupTyping") && groupChat.includes("onGroupTyping") && groupChat.includes("clearTimeout"));
assert("direct read state is backend backed", directChat.includes("useDirectReadStateQuery") && messagesResource.includes("/messages/read-state/direct/"));
assert("direct read event updates React Query", directChat.includes("onDirectRead") && directChat.includes("messageKeys.directReadState"));
assert("no delivered receipt state", !directChat.includes("Entregue") && !directChat.includes("delivered"));
assert("typing has stale expiry", directChat.includes("4000") && groupChat.includes("4000"));
assert("message lifecycle mutations use resource", messagesResource.includes("useEditDirectMessageMutation") && messagesResource.includes("useDeleteDirectMessageMutation") && messagesResource.includes("useEditGroupMessageMutation") && messagesResource.includes("useDeleteGroupMessageMutation"));
assert("delete confirmation is web safe and native confirmed", confirmDelete.includes("window.confirm") && confirmDelete.includes("Alert.alert") && directChat.includes("confirmDelete") && groupChat.includes("confirmDelete"));
assert("delete remains gated by confirmation", directChat.includes("confirmDelete(() =>") && directChat.includes("deleteMutation.mutateAsync({ messageId })") && groupChat.includes("confirmDelete(() =>") && groupChat.includes("deleteMutation.mutateAsync({ groupId, messageId })"));
assert("message actions are contextual, not inline", contextActions.includes("onLongPress") && contextActions.includes("contextmenu") && !directChat.includes("styles.messageActions") && !groupChat.includes("styles.messageActions"));
assert("context target owns bubble width constraint", contextActions.includes('maxWidth: "75%"') && directChat.includes('maxWidth: "100%"') && groupChat.includes('maxWidth: "100%"'));
assert("deleted messages have no lifecycle actions", directChat.includes("enabled={!item.deletedAt}") && groupChat.includes("enabled={!item.deletedAt}") && contextActions.includes("own ?"));
assert("deleted context menu state is cleared", directChat.includes("if (activeContextMessageId === message.id)") && groupChat.includes("if (activeContextMessageId === message.id)"));
assert("context menu supports escape cleanup", contextActions.includes("onCancel") && directChat.includes("onCancel={closeContextMenu}") && groupChat.includes("onCancel={closeContextMenu}"));
assert("single edit mode is composer-level", directChat.includes("editingId") && groupChat.includes("editingId") && directChat.includes("editBar") && groupChat.includes("editBar") && directChat.includes("setEditingId(null)") && groupChat.includes("setEditingId(null)"));
assert("edit mode suppresses typing", directChat.includes("!friendId || editingId") && groupChat.includes("!groupId || editingId"));
assert("delete clears active edit target", directChat.includes("if (editingId === messageId)") && groupChat.includes("if (editingId === messageId)") && directChat.includes("if (editingId === message.id)") && groupChat.includes("if (editingId === message.id)"));
assert("single global message menu per chat", (directChat.match(/<MessageActionMenu/g) || []).length === 1 && (groupChat.match(/<MessageActionMenu/g) || []).length === 1 && !contextActions.includes("useState"));
assert("context menu is outside message map", directChat.indexOf("<MessageActionMenu") > directChat.lastIndexOf("</FlatList>") && groupChat.indexOf("<MessageActionMenu") > groupChat.lastIndexOf("</FlatList>"));
assert("outside click closes menu with cleanup", contextActions.includes("pointerdown") && contextActions.includes("menu.contains") && contextActions.includes("removeEventListener(\"pointerdown\""));
assert("outside click does not cancel edit mode", directChat.includes("onCancel={closeContextMenu}") && groupChat.includes("onCancel={closeContextMenu}") && !contextActions.includes("setEditing"));
assert("socket lifecycle events update cache by id", directChat.includes("onDirectMessageUpdated") && directChat.includes("onDirectMessageDeleted") && groupChat.includes("onMessageUpdated") && groupChat.includes("onMessageDeleted"));
assert("deleted messages render safe placeholder", directChat.includes("Mensagem excluída") && groupChat.includes("Mensagem excluída"));
assert("message lifecycle schema fields exist", messagesResource.includes("editedAt") && messagesResource.includes("deletedAt"));
assert("fixed ReactionType mapping", messagesResource.includes('REACTION_TYPES') && messagesResource.includes('type ReactionType'));
assert("reaction resources use apiClient", messagesResource.includes('setDirectMessageReaction') && messagesResource.includes('setGroupMessageReaction') && messagesResource.includes('method: "PUT"'));
assert("reaction context supports peers", contextActions.includes('reaction') && directChat.includes('enabled={!item.deletedAt}') && groupChat.includes('enabled={!item.deletedAt}'));
assert("reactions do not affect unread or inbox", !messagesResource.includes('invalidateQueries({ queryKey: messageKeys.unreadCount })') || messagesResource.includes('useSetDirectMessageReactionMutation'));
assert("deleted messages hide reactions", directChat.includes('!item.deletedAt && item.reactions') && groupChat.includes('!item.deletedAt && item.reactions'));
assert("reaction pills do not expose user lists", !messagesResource.includes('reactedBy') && !messagesResource.includes('userIds'));
assert("context menu uses safe viewport clamping", contextActions.includes("SAFE_MARGIN") && contextActions.includes("window.innerWidth") && contextActions.includes("window.innerHeight") && contextActions.includes("clampMenuPosition"));
assert("context menu remains a single overlay", contextActions.includes('position: "absolute"') && directChat.includes("activeContextMessageId ? <MessageActionMenu") && groupChat.includes("activeContextMessageId ? <MessageActionMenu"));

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
