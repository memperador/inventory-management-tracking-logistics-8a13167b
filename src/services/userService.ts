
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user';

export const fetchUsers = async (): Promise<User[]> => {
  // Fetch users and profiles separately since the join isn't working
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('id, role, created_at');
  
  if (usersError) throw usersError;
  
  // Transform the data with placeholder names
  return usersData.map(user => ({
    id: user.id,
    name: 'User', // Default name
    email: 'user@example.com', // Placeholder
    role: user.role,
    status: 'active', // Placeholder
    lastActive: user.created_at // Using creation date as last active
  }));
};

export const fetchProfiles = async (users: User[]): Promise<User[]> => {
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name');
  
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    return users;
  }
  
  if (profilesData && profilesData.length > 0) {
    // Update user names if profile exists
    const updatedUsers = [...users];
    updatedUsers.forEach(user => {
      const userProfile = profilesData.find(profile => profile.id === user.id);
      if (userProfile) {
        user.name = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Unknown User';
      }
    });
    return updatedUsers;
  }
  
  return users;
};
