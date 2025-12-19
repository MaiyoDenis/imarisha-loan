import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PermissionsManager: React.FC = () => {
    const [roles, setRoles] = useState<any[]>([]);
    const [permissions, setPermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rolesRes, permissionsRes] = await Promise.all([
                    axios.get('/api/permissions/roles'),
                    axios.get('/api/permissions')
                ]);
                setRoles(rolesRes.data);
                setPermissions(permissionsRes.data);
            } catch (err) {
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAssignPermission = async (roleId: number, permissionId: number) => {
        try {
            await axios.post(`/api/permissions/roles/${roleId}/permissions`, { permission_id: permissionId });
            alert('Permission assigned successfully');
        } catch (err) {
            alert('Failed to assign permission');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h1>Permissions Management</h1>
            <div>
                <h2>Roles</h2>
                <ul>
                    {roles.map(role => (
                        <li key={role.id}>
                            {role.name}
                            <ul>
                                {role.permissions.map((p: string) => <li key={p}>{p}</li>)}
                            </ul>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h2>Permissions</h2>
                <ul>
                    {permissions.map(permission => (
                        <li key={permission.id}>{permission.name}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default PermissionsManager;
