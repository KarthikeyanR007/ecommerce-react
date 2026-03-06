import { useState } from "react";
import {
  Calendar,
  Edit2,
  Filter,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Users as UsersIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./Users.css";

type UserStatus = "active" | "inactive" | "pending";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  status: UserStatus;
  role: string;
  avatar: string;
  joinedDate: string;
  lastActive: string;
  orders: number;
}

interface Stat {
  label: string;
  value: string;
  change: string;
  Icon: LucideIcon;
}

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | UserStatus>("all");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const users: User[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      location: "New York, USA",
      status: "active",
      role: "Admin",
      avatar: "https://ui-avatars.com/api/?name=John+Doe&background=667eea&color=fff",
      joinedDate: "2024-01-15",
      lastActive: "5 minutes ago",
      orders: 156,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "+1 (555) 234-5678",
      location: "Los Angeles, USA",
      status: "active",
      role: "Customer",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=764ba2&color=fff",
      joinedDate: "2024-02-20",
      lastActive: "1 hour ago",
      orders: 89,
    },
    {
      id: 3,
      name: "Michael Chen",
      email: "michael.chen@example.com",
      phone: "+1 (555) 345-6789",
      location: "San Francisco, USA",
      status: "inactive",
      role: "Customer",
      avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=f093fb&color=fff",
      joinedDate: "2024-01-10",
      lastActive: "2 days ago",
      orders: 34,
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.d@example.com",
      phone: "+1 (555) 456-7890",
      location: "Chicago, USA",
      status: "pending",
      role: "Customer",
      avatar: "https://ui-avatars.com/api/?name=Emily+Davis&background=4facfe&color=fff",
      joinedDate: "2024-03-01",
      lastActive: "Just now",
      orders: 12,
    },
    {
      id: 5,
      name: "Robert Wilson",
      email: "robert.w@example.com",
      phone: "+1 (555) 567-8901",
      location: "Miami, USA",
      status: "active",
      role: "Moderator",
      avatar: "https://ui-avatars.com/api/?name=Robert+Wilson&background=43e97b&color=fff",
      joinedDate: "2023-12-05",
      lastActive: "30 minutes ago",
      orders: 245,
    },
    {
      id: 6,
      name: "Lisa Anderson",
      email: "lisa.a@example.com",
      phone: "+1 (555) 678-9012",
      location: "Seattle, USA",
      status: "active",
      role: "Customer",
      avatar: "https://ui-avatars.com/api/?name=Lisa+Anderson&background=38f9d7&color=fff",
      joinedDate: "2024-02-28",
      lastActive: "15 minutes ago",
      orders: 67,
    },
  ];

  const stats: Stat[] = [
    { label: "Total Users", value: "8,547", change: "+12%", Icon: UsersIcon },
    { label: "Active Users", value: "6,234", change: "+8%", Icon: UserCheck },
    { label: "New This Month", value: "342", change: "+23%", Icon: Plus },
    { label: "Inactive", value: "1,971", change: "-5%", Icon: UserX },
  ];

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const handleSelectUser = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusClass = (status: UserStatus) => {
    switch (status) {
      case "active":
        return "status-active";
      case "inactive":
        return "status-inactive";
      case "pending":
        return "status-pending";
      default:
        return "";
    }
  };

  return (
    <div className="users-page">
      <div className="users-header">
        <div>
          <h1 className="page-title">Users Management</h1>
          <p className="page-subtitle">Manage your users, their roles and permissions</p>
        </div>
        <button className="add-user-btn" type="button">
          <Plus size={20} />
          <span>Add New User</span>
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">
              <stat.Icon size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <div className="stat-value-wrapper">
                <span className="stat-value">{stat.value}</span>
                <span className={`stat-change ${stat.change.includes("+") ? "positive" : "negative"}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="filters-section">
        <div className="search-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name, email or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-wrapper">
          <Filter size={20} className="filter-icon" />
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | UserStatus)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="users-table-container">
        {selectedUsers.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">{selectedUsers.length} users selected</span>
            <div className="bulk-buttons">
              <button className="bulk-btn" type="button">
                <UserCheck size={16} />
                Activate
              </button>
              <button className="bulk-btn" type="button">
                <UserX size={16} />
                Deactivate
              </button>
              <button className="bulk-btn delete" type="button">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        )}

        <table className="users-table">
          <thead>
            <tr>
              <th className="checkbox-cell">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length}
                  onChange={handleSelectAll}
                  className="checkbox"
                />
              </th>
              <th>User</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Status</th>
              <th>Role</th>
              <th>Orders</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className={selectedUsers.includes(user.id) ? "selected" : ""}>
                <td className="checkbox-cell">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="checkbox"
                  />
                </td>
                <td className="user-cell">
                  <div className="user-info">
                    <img src={user.avatar} alt={user.name} className="user-avatar" />
                    <div>
                      <div className="user-name">{user.name}</div>
                      <div className="user-joined">
                        Joined {new Date(user.joinedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <div className="contact-item">
                      <Mail size={14} />
                      <span>{user.email}</span>
                    </div>
                    <div className="contact-item">
                      <Phone size={14} />
                      <span>{user.phone}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="location">
                    <MapPin size={14} />
                    <span>{user.location}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(user.status)}`}>{user.status}</span>
                </td>
                <td>
                  <span className="role-badge">{user.role}</span>
                </td>
                <td className="orders-cell">
                  <span className="orders-count">{user.orders}</span>
                </td>
                <td>
                  <div className="last-active">
                    <Calendar size={14} />
                    <span>{user.lastActive}</span>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit" title="Edit" type="button">
                      <Edit2 size={16} />
                    </button>
                    <button className="action-btn delete" title="Delete" type="button">
                      <Trash2 size={16} />
                    </button>
                    <button className="action-btn more" title="More" type="button">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <div className="pagination-info">
            Showing 1 to {filteredUsers.length} of {users.length} results
          </div>
          <div className="pagination-buttons">
            <button className="pagination-btn" type="button" disabled>
              Previous
            </button>
            <button className="pagination-btn active" type="button">
              1
            </button>
            <button className="pagination-btn" type="button">
              2
            </button>
            <button className="pagination-btn" type="button">
              3
            </button>
            <button className="pagination-btn" type="button">
              4
            </button>
            <button className="pagination-btn" type="button">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
