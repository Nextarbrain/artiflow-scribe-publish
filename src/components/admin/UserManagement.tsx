
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAdminManagement } from '@/hooks/useAdminManagement';
import { Users, Mail, Phone, Globe, Calendar, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const UserManagement = () => {
  const { users, loading, fetchUsers, updateUserStatus } = useAdminManagement();

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      suspended: "secondary",
      banned: "destructive"
    };
    return <Badge variant={variants[status || 'active'] || "secondary"}>{status || 'active'}</Badge>;
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    }
    return email?.[0]?.toUpperCase() || 'U';
  };

  const handleUpdateUserStatus = async (userId: string, status: string) => {
    await updateUserStatus(userId, status);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage platform users and their access</p>
        </div>
        <Button onClick={fetchUsers} variant="outline">
          Refresh
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(user.full_name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.full_name || 'Unknown User'}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      {user.phone && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {user.email_verified ? 'Verified' : 'Unverified'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    {user.country ? (
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {user.country}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {user.last_login_at ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true })}
                      </div>
                    ) : 'Never'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.status || 'active'}
                      onValueChange={(value) => handleUpdateUserStatus(user.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="banned">Banned</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default UserManagement;
