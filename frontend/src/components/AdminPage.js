import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';
import { adminApi } from '../services/ApiService';
import { toast } from 'react-hot-toast';
import { colors, LoadingMessage } from '../styles/commonStyles';

const Input = styled.input`
  padding: 12px;
  border: 1.5px solid #999;
  border-radius: 8px;
  font-size: 16px;
  width: 100%;
  transition: all 0.3s ease;

  &:focus {
    border-color: ${colors.accent};
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    outline: none;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 1.5px solid #999;
  border-radius: 8px;
  font-size: 16px;
  width: 100%;
  transition: all 0.3s ease;
  background-color: white;

  &:focus {
    border-color: ${colors.accent};
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    outline: none;
  }
`;

const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    userDateFrom: '',
    userDateTo: '',
    propertyDateFrom: '',
    propertyDateTo: '',
    propertyStatus: '',
    userRole: '',
    feedbackDateFrom: '',
    feedbackDateTo: ''
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getDashboardStats();
      setStats(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await adminApi.getDashboardStats(queryParams);
      setStats(response.data);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    dispatch(logoutUser());
    navigate('/');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const FilterSection = styled.div`
    background: ${colors.white};
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  `;

  const FilterGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  `;

  const renderUserFilters = () => (
    <FilterSection>
      <h3>Filter Users</h3>
      <FilterGrid>
        <Input
          type="date"
          name="userDateFrom"
          value={filters.userDateFrom}
          onChange={handleFilterChange}
          placeholder="From Date"
        />
        <Input
          type="date"
          name="userDateTo"
          value={filters.userDateTo}
          onChange={handleFilterChange}
          placeholder="To Date"
        />
        <Select
          name="userRole"
          value={filters.userRole}
          onChange={handleFilterChange}
        >
          <option value="">All Roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="employee">Employee</option>
        </Select>
      </FilterGrid>
      <ApplyFilterButton onClick={applyFilters}>Apply Filters</ApplyFilterButton>
    </FilterSection>
  );

  const renderPropertyFilters = () => (
    <FilterSection>
      <h3>Filter Properties</h3>
      <FilterGrid>
        <Input
          type="date"
          name="propertyDateFrom"
          value={filters.propertyDateFrom}
          onChange={handleFilterChange}
          placeholder="From Date"
        />
        <Input
          type="date"
          name="propertyDateTo"
          value={filters.propertyDateTo}
          onChange={handleFilterChange}
          placeholder="To Date"
        />
        <Select
          name="propertyStatus"
          value={filters.propertyStatus}
          onChange={handleFilterChange}
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="pending">Pending</option>
          <option value="sold">Sold</option>
        </Select>
      </FilterGrid>
      <ApplyFilterButton onClick={applyFilters}>Apply Filters</ApplyFilterButton>
    </FilterSection>
  );

  const renderFeedbackFilters = () => (
    <FilterSection>
      <h3>Filter Feedback</h3>
      <FilterGrid>
        <Input
          type="date"
          name="feedbackDateFrom"
          value={filters.feedbackDateFrom}
          onChange={handleFilterChange}
          placeholder="From Date"
        />
        <Input
          type="date"
          name="feedbackDateTo"
          value={filters.feedbackDateTo}
          onChange={handleFilterChange}
          placeholder="To Date"
        />
      </FilterGrid>
      <ApplyFilterButton onClick={applyFilters}>Apply Filters</ApplyFilterButton>
    </FilterSection>
  );

  const renderDashboard = () => (
    <DashboardGrid>
      <StatCard>
        <StatTitle>User Statistics</StatTitle>
        <StatValue>
          {(stats?.totalCounts?.buyers || 0) + 
           (stats?.totalCounts?.sellers || 0) + 
           (stats?.totalCounts?.employees || 0)}
        </StatValue>
        <StatDetails>
          <StatDetail>Buyers: {stats?.totalCounts?.buyers || 0}</StatDetail>
          <StatDetail>Sellers: {stats?.totalCounts?.sellers || 0}</StatDetail>
          <StatDetail>Employees: {stats?.totalCounts?.employees || 0}</StatDetail>
        </StatDetails>
      </StatCard>

      <StatCard>
        <StatTitle>Employee Overview</StatTitle>
        <StatValue>{stats?.employeeStats?.total || 0}</StatValue>
        <StatDetails>
          <StatDetail>Active: {stats?.employeeStats?.active || 0}</StatDetail>
          <StatDetail>Inactive: {stats?.employeeStats?.inactive || 0}</StatDetail>
        </StatDetails>
      </StatCard>

      <StatCard>
        <StatTitle>Property Overview</StatTitle>
        <StatValue>{stats?.totalCounts?.properties || 0}</StatValue>
        <StatDetails>
          <StatDetail>Available: {stats?.propertyStatus?.available || 0}</StatDetail>
          <StatDetail>Pending: {stats?.propertyStatus?.pending || 0}</StatDetail>
          <StatDetail>Sold: {stats?.propertyStatus?.sold || 0}</StatDetail>
        </StatDetails>
      </StatCard>

      <RecentActivityCard>
        <StatTitle>Recent Properties</StatTitle>
        {stats?.recentProperties?.length > 0 ? (
          stats.recentProperties.map(property => (
            <ActivityItem key={property.id}>
              <PropertyTitle>{property.title}</PropertyTitle>
              <PropertyDetails>
                <span>₹{property.price?.toLocaleString()}</span>
                <StatusBadge $status={property.status}>{property.status}</StatusBadge>
              </PropertyDetails>
            </ActivityItem>
          ))
        ) : (
          <ActivityItem>No recent properties</ActivityItem>
        )}
      </RecentActivityCard>
    </DashboardGrid>
  );

  const renderUsers = () => (
    <TableContainer>
      <Table>
        <TableHeader>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined Date</th>
          </tr>
        </TableHeader>
        <TableBody>
          {stats?.users?.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderProperties = () => (
    <TableContainer>
      <Table>
        <TableHeader>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Status</th>
            <th>Listed Date</th>
          </tr>
        </TableHeader>
        <TableBody>
          {stats?.properties?.map(property => (
            <tr key={property._id}>
              <td>{property.title}</td>
              <td>₹{property.price.toLocaleString()}</td>
              <td><StatusBadge $status={property.status}>{property.status}</StatusBadge></td>
              <td>{new Date(property.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderFeedback = () => (
    <FeedbackContainer>
      {stats?.feedbacks?.map(feedback => (
        <FeedbackCard key={feedback._id}>
          <FeedbackContent>{feedback.message}</FeedbackContent>
          <FeedbackDetails>
            <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
          </FeedbackDetails>
        </FeedbackCard>
      ))}
    </FeedbackContainer>
  );

  if (loading) return <LoadingWrapper>Loading...</LoadingWrapper>;
  if (error) return <ErrorDisplay error={error} onRetry={fetchDashboardData} />;

  return (
    <PageContainer>
      <Sidebar>
        <SidebarTitle>Admin Dashboard</SidebarTitle>
        <NavContainer>
          <NavItem>
            <NavButton 
              $active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </NavButton>
          </NavItem>
          <NavItem>
            <NavButton 
              $active={activeTab === 'users'} 
              onClick={() => setActiveTab('users')}
            >
              Users
            </NavButton>
          </NavItem>
          <NavItem>
            <NavButton 
              $active={activeTab === 'properties'} 
              onClick={() => setActiveTab('properties')}
            >
              Properties
            </NavButton>
          </NavItem>
          <NavItem>
            <NavButton 
              $active={activeTab === 'feedback'} 
              onClick={() => setActiveTab('feedback')}
            >
              Feedback
            </NavButton>
          </NavItem>
        </NavContainer>
        <LogoutSection>
          <LogoutButton onClick={handleLogout}>
            Logout
          </LogoutButton>
        </LogoutSection>
      </Sidebar>

      <MainContent>
        {activeTab === 'dashboard' && (
          <>
            <PageTitle>Dashboard Overview</PageTitle>
            {renderDashboard()}
          </>
        )}

        {activeTab === 'users' && (
          <>
            {renderUserFilters()}
            {renderUsers()}
          </>
        )}

        {activeTab === 'properties' && (
          <>
            {renderPropertyFilters()}
            {renderProperties()}
          </>
        )}

        {activeTab === 'feedback' && (
          <>
            {renderFeedbackFilters()}
            {renderFeedback()}
          </>
        )}
      </MainContent>
    </PageContainer>
  );
};

// Updated styled components with better visibility
const PageContainer = styled.div`
  height: 100%;
  position: relative;
  background: #eee;
  min-height: 100vh;
`;

const Sidebar = styled.div`
  width: 210px;
  position: fixed;
  height: 100vh;
  background-image: url('/static/images/sidebar.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  padding: 10px;
  background: #7055c1;
  background: linear-gradient(to bottom, rgba(112, 85, 193, 1), rgba(49, 49, 49, 0.7));
`;

const SidebarTitle = styled.h1`
  padding: 30px 20px;
  text-align: center;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-weight: 300;
  font-size: 20px;
  margin: 0;
`;

const NavContainer = styled.ul`
  padding: 20px 5px;
  list-style: none;
  margin: 0;
`;

const NavItem = styled.li`
  display: block;
  border-radius: 5px;
  overflow: hidden;
`;

const NavButton = styled.button`
  width: 100%;
  padding: 12px;
  margin: 4px 0;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$active ? colors.primary : 'transparent'};
  color: ${props => props.$active ? 'white' : colors.text};

  &:hover {
    background: ${props => props.$active ? colors.primary : colors.hover};
  }
`;

const LogoutSection = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 17px 15px 21px;
  color: #fff;
  letter-spacing: 1px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
`;

const LogoutButton = styled(NavButton)`
  font-size: 14px;
  padding: 12px 20px;
  color: #fff;
  
  &:hover {
    color: #000;
  }
`;

const MainContent = styled.div`
  margin-left: 280px;
  padding: 20px;
  position: relative;
`;

const PageTitle = styled.h1`
  font-size: 5rem;
  color: ${colors.primary};
  margin-bottom: 30px;
  text-align: center;
  font-weight: 600;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const StatCard = styled.div`
  background: ${colors.white};
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const StatTitle = styled.h3`
  color: ${colors.neutral};
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 500;
`;

const StatValue = styled.div`
  color: ${colors.primary};
  font-size: 3rem;
  font-weight: 700;
  margin: 1rem 0;
`;

const StatDetail = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 2.2rem;
  color: ${colors.neutral};
  border-bottom: 1px solid ${colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const PropertyTitle = styled.h4`
  font-size: 2rem;
  color: ${colors.primary};
  margin: 0;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  background: ${props => {
    switch(props.$status) {
      case 'available': return '#e1f7e1';
      case 'pending': return '#fff3e1';
      case 'sold': return '#ffe1e1';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch(props.$status) {
      case 'available': return '#2e7d32';
      case 'pending': return '#ed6c02';
      case 'sold': return '#d32f2f';
      default: return '#666666';
    }
  }};
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5rem;
  color: #666;
`;

const ErrorDisplay = ({ error, onRetry }) => {
  return (
    <LoadingWrapper>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#dc3545', marginBottom: '1rem' }}>{error}</p>
        <button 
          onClick={onRetry}
          style={{
            padding: '8px 16px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    </LoadingWrapper>
  );
};

const RecentActivityCard = styled(StatCard)`
  grid-column: span 2;
`;

const ActivityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid ${colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const PropertyDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const FeedbackContent = styled.p`
  font-size: 2.2rem;
  color: ${colors.neutral};
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const FeedbackDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 2rem;
  color: ${colors.neutral};
  
  span {
    display: flex;
    align-items: center;
    gap: 5px;
  }
`;

const FeedbackCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
`;

const FeedbackContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const StatDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const TableContainer = styled.div`
  margin-top: 2rem;
  background: ${colors.white};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: ${colors.background};
  th {
    padding: 1.2rem;
    text-align: left;
    font-weight: 600;
    color: ${colors.primary};
    font-size: 16px;
  }
`;

const TableBody = styled.tbody`
  td {
    padding: 1.2rem;
    border-bottom: 1px solid ${colors.border};
    font-size: 16px;
  }

  tr:hover {
    background-color: ${colors.background};
  }
`;

const ApplyFilterButton = styled.button`
  padding: 12px 24px;
  background: ${colors.accent};
  color: ${colors.white};
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    background: ${colors.gold};
    transform: translateY(-2px);
  }
`;

// Export the component
export default AdminPage;