
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user';

export const fetchUsers = async (): Promise<User[]> => {
  try {
    // First fetch users
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, role, created_at, tenant_id');
    
    if (usersError) throw usersError;
    
    // Try to get user emails another way (since we can't access auth.users directly)
    // This is a simplified approach for demonstration purposes
    const usersWithData = usersData.map(user => {
      return {
        id: user.id,
        name: 'User', // Will be updated when profiles are fetched
        email: `user-${user.id.substring(0, 5)}@example.com`, // Placeholder email
        role: user.role,
        status: 'active' as const, // Fixed typing by using const assertion
        lastActive: user.created_at,
        tenantId: user.tenant_id // Keep track of tenant ID for display
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
          user.name = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Unknown User';
          
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
