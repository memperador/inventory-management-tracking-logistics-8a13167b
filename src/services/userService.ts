
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user';

export const fetchUsers = async (): Promise<User[]> => {
  try {
    // First fetch users with their roles
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, role, created_at, tenant_id');
    
    if (usersError) throw usersError;
    
    // Then try to get profile data to get real names
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, tenant_id');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }
    
    // Get real user emails via the edge function
    const { data: authUsersData, error: authUsersError } = await supabase.functions.invoke('get-user-by-email');
    
    if (authUsersError) {
      console.error('Error fetching auth users:', authUsersError);
    }
    
    // Map auth user emails to our users
    const emailMap = new Map();
    if (authUsersData && Array.isArray(authUsersData)) {
      authUsersData.forEach(user => {
        if (user && user.id && user.email) {
          emailMap.set(user.id, user.email);
        }
      });
    }
    
    const usersWithData = usersData.map(user => {
      // Find profile for this user
      const profile = profilesData?.find(p => p.id === user.id);
      
      // Get email from auth data or use placeholder with user ID
      const email = emailMap.get(user.id) || `user-${user.id.substring(0, 8)}@example.com`;
      
      // Generate a better display name based on available information
      let name = '';
      const firstName = profile?.first_name || '';
      const lastName = profile?.last_name || '';
      
      if (firstName || lastName) {
        // Use available name parts
        name = `${firstName} ${lastName}`.trim();
      } else {
        // Create a name based on email if available, fallback to user ID
        const emailPrefix = email.split('@')[0];
        if (emailPrefix && !emailPrefix.startsWith('user-')) {
          name = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
        } else {
          name = `User ${user.id.substring(0, 6)}`;
        }
      }
      
      return {
        id: user.id,
        name,
        email,
        role: user.role,
        status: 'active' as const,
        lastActive: user.created_at,
        tenantId: user.tenant_id
      };
    });
    
    return usersWithData;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const fetchProfiles = async (users: User[]): Promise<User[]> => {
  try {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, tenant_id');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return users;
    }
    
    // Also get tenant names for context
    const { data: tenantsData, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name');
      
    if (tenantsError) {
      console.warn('Error fetching tenant names:', tenantsError);
    }
    
    if (profilesData && profilesData.length > 0) {
      // Update user names if profile exists
      const updatedUsers = [...users];
      updatedUsers.forEach(user => {
        const userProfile = profilesData.find(profile => profile.id === user.id);
        if (userProfile) {
          // Only update name if we have actual profile data
          if (userProfile.first_name || userProfile.last_name) {
            user.name = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
          }
          
          // Also append tenant name if available
          if (user.tenantId) {
            const tenant = tenantsData?.find(t => t.id === user.tenantId);
            if (tenant) {
              user.tenantName = tenant.name;
            }
          }
        }
      });
      return updatedUsers;
    }
    
    return users;
  } catch (error) {
    console.error('Error processing profiles:', error);
    return users;
  }
};
