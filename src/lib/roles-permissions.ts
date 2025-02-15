export type Role =
    | 'WORKSPACE_OWNER'
    | 'WORKSPACE_ADMIN'
    | 'TEAM_OWNER'
    | 'TEAM_ADMIN'
    | 'MEMBER'
    | 'INVITER'
    | 'INVITEE'

// Define actions for Workspace, Team, and Invitation entities
type WorkspaceAction =
    | 'createWorkspace'
    | 'deleteWorkspace'
    | 'updateWorkspace'
    | 'listWorkspaceMembers'
    | 'inviteToWorkspace'
    | 'removeMemberFromWorkspace'
    | 'viewWorkspaceDetails'
    | 'viewTeams'
    | 'createTeam'
    | 'deleteTeam'
    | 'manageSubscription'
    | 'viewInvitations'
    | 'leaveWorkspace'

type TeamAction =
    | 'createTeam'
    | 'deleteTeam'
    | 'updateTeam'
    | 'inviteToTeam'
    | 'removeMemberFromTeam'
    | 'viewTeamDetails'
    | 'assignRolesInTeam'
    | 'viewWorkspaceOfTeam'
    | 'listTeamMembers'
    | 'viewTeamInvitations'
    | 'leaveTeam'

type InvitationAction =
    | 'sendInvitation'
    | 'revokeInvitation'
    | 'acceptInvitation'
    | 'declineInvitation'
    | 'setRoleOnInvitation'
    | 'viewInvitationDetails'
    | 'resendInvitation'

// Union of all actions
type Action = WorkspaceAction | TeamAction | InvitationAction

// Permissions mapping for Workspace actions
const workspacePermissions: Record<Role, WorkspaceAction[]> = {
    WORKSPACE_OWNER: [
        'createWorkspace',
        'deleteWorkspace',
        'updateWorkspace',
        'listWorkspaceMembers',
        'inviteToWorkspace',
        'removeMemberFromWorkspace',
        'viewWorkspaceDetails',
        'viewTeams',
        'createTeam',
        'deleteTeam',
        'manageSubscription',
        'viewInvitations',
    ],
    WORKSPACE_ADMIN: [
        'updateWorkspace',
        'listWorkspaceMembers',
        'inviteToWorkspace',
        'removeMemberFromWorkspace',
        'viewWorkspaceDetails',
        'viewTeams',
        'createTeam',
        'deleteTeam',
        'viewInvitations',
        'leaveWorkspace',
    ],
    TEAM_OWNER: ['viewWorkspaceDetails', 'viewTeams', 'viewInvitations', 'leaveWorkspace'],
    TEAM_ADMIN: ['viewWorkspaceDetails', 'viewTeams', 'viewInvitations', 'leaveWorkspace'],
    MEMBER: ['viewWorkspaceDetails', 'viewTeams', 'leaveWorkspace', 'listWorkspaceMembers'],
    INVITER: [],
    INVITEE: [],
}

// Permissions mapping for Team actions
const teamPermissions: Record<Role, TeamAction[]> = {
    WORKSPACE_OWNER: [
        'createTeam',
        'deleteTeam',
        'updateTeam',
        'inviteToTeam',
        'removeMemberFromTeam',
        'viewTeamDetails',
        'assignRolesInTeam',
        'viewWorkspaceOfTeam',
        'listTeamMembers',
        'viewTeamInvitations',
    ],
    WORKSPACE_ADMIN: [
        'createTeam',
        'deleteTeam',
        'updateTeam',
        'inviteToTeam',
        'removeMemberFromTeam',
        'viewTeamDetails',
        'assignRolesInTeam',
        'viewWorkspaceOfTeam',
        'listTeamMembers',
        'viewTeamInvitations',
    ],
    TEAM_OWNER: [
        'createTeam',
        'deleteTeam',
        'updateTeam',
        'inviteToTeam',
        'removeMemberFromTeam',
        'viewTeamDetails',
        'assignRolesInTeam',
        'viewWorkspaceOfTeam',
        'listTeamMembers',
        'viewTeamInvitations',
    ],
    TEAM_ADMIN: [
        'updateTeam',
        'inviteToTeam',
        'removeMemberFromTeam',
        'viewTeamDetails',
        'assignRolesInTeam',
        'viewWorkspaceOfTeam',
        'listTeamMembers',
        'viewTeamInvitations',
        'leaveTeam',
    ],
    MEMBER: ['viewTeamDetails', 'viewWorkspaceOfTeam', 'listTeamMembers', 'leaveTeam'],
    INVITER: [],
    INVITEE: [],
}

// Permissions mapping for Invitation actions
const invitationPermissions: Record<Role, InvitationAction[]> = {
    WORKSPACE_OWNER: [
        'sendInvitation',
        'revokeInvitation',
        'setRoleOnInvitation',
        'viewInvitationDetails',
        'resendInvitation',
    ],
    WORKSPACE_ADMIN: [
        'sendInvitation',
        'revokeInvitation',
        'setRoleOnInvitation',
        'viewInvitationDetails',
        'resendInvitation',
    ],
    TEAM_OWNER: ['sendInvitation', 'revokeInvitation', 'viewInvitationDetails', 'resendInvitation'],
    TEAM_ADMIN: ['sendInvitation', 'viewInvitationDetails', 'resendInvitation'],
    MEMBER: [],
    INVITER: ['sendInvitation', 'viewInvitationDetails', 'resendInvitation'],
    INVITEE: ['acceptInvitation', 'declineInvitation', 'viewInvitationDetails'],
}

// Consolidated permissions object
const permissions: Record<'workspace' | 'team' | 'invitation', Record<Role, Action[]>> = {
    workspace: workspacePermissions,
    team: teamPermissions,
    invitation: invitationPermissions,
}

// Helper function to check workspace permissions
export const hasWorkspacePermission = (role: Role, action: WorkspaceAction): boolean => {
    return permissions.workspace[role]?.includes(action) ?? false
}

// Helper function to check team permissions
export const hasTeamPermission = (role: Role, action: TeamAction): boolean => {
    return permissions.team[role]?.includes(action) ?? false
}

// Helper function to check invitation permissions
export const hasInvitationPermission = (role: Role, action: InvitationAction): boolean => {
    return permissions.invitation[role]?.includes(action) ?? false
}

// General helper function to check any permission
export const hasPermission = (role: Role, action: Action, scope: 'workspace' | 'team' | 'invitation'): boolean => {
    return permissions[scope][role]?.includes(action) ?? false
}

export function determineUserRole(user: any, workspace: any, team?: any): Role | null {
    if (!user || !workspace) return null

    // Normalize backend role values to match frontend expectations
    const normalizeRole = (role: string): Role | null => {
        const roleMap: Record<string, Role> = {
            owner: 'WORKSPACE_OWNER',
            admin: 'WORKSPACE_ADMIN',
            member: 'MEMBER',
        }
        return roleMap[role] || null
    }

    // ✅ Check Workspace Owner First
    if (workspace.owner.email === user.email) return 'WORKSPACE_OWNER'

    // ✅ Check Workspace Members
    const workspaceMember = workspace.members?.find((m: any) => m.user.email === user.email)
    if (workspaceMember) return normalizeRole(workspaceMember.role)

    // ✅ Stop here if no team is provided
    if (!team) return null

    // ✅ Check Team Owner
    if (team.owner?.email === user.email) return 'TEAM_OWNER'

    // ✅ Check Team Members
    const teamMember = team.members?.find((m: any) => m.user.email === user.email)
    if (teamMember) return normalizeRole(teamMember.role)

    // ✅ No Role Found
    return null
}
