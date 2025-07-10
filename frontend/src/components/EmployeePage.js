import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';
import { colors } from '../styles/AuthStyles';
import { FaSignOutAlt, FaUpload, FaChartLine, FaList, FaTrash, FaEdit } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { advertisementApi, employeeApi } from '../services/ApiService';
import { LoadingMessage } from '../styles/commonStyles';

const EmployeePage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [advertisements, setAdvertisements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('upload');
    const [editingId, setEditingId] = useState(null);
    const [mockData] = useState({
        monthlyAds: [
            { month: 'Jan', count: 4 },
            { month: 'Feb', count: 6 },
            { month: 'Mar', count: 8 },
            { month: 'Apr', count: 5 },
            { month: 'May', count: 9 },
            { month: 'Jun', count: 7 },
        ],
        adPerformance: [
            { name: 'Views', value: 400 },
            { name: 'Clicks', value: 300 },
            { name: 'Conversions', value: 100 },
        ],
        transactions: [
            { id: 'tx_1234', date: '2024-03-15', amount: 99.99, status: 'completed' },
            { id: 'tx_5678', date: '2024-03-14', amount: 149.99, status: 'completed' },
            { id: 'tx_9012', date: '2024-03-13', amount: 199.99, status: 'pending' },
        ]
    });
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
    const [advertisementRequests, setAdvertisementRequests] = useState([]);
    
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = useCallback(() => {
        dispatch(logoutUser());
        navigate('/login');
    }, [dispatch, navigate]);

    const fetchAdvertisements = useCallback(async () => {
        try {
            const response = await employeeApi.getAdvertisements();
            setAdvertisements(response.data);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to fetch advertisements');
            if (error.response?.status === 401) {
                handleLogout();
            }
        }
    }, [handleLogout]);

    useEffect(() => {
        fetchAdvertisements();
    }, [fetchAdvertisements]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            if (image) {
                formData.append('file', image);
            }

            if (editingId) {
                // Update existing advertisement
                await employeeApi.updateAdvertisement(editingId, formData);
                toast.success('Advertisement updated successfully!');
            } else {
                // Create new advertisement
                await employeeApi.createAdvertisement(formData);
                toast.success('Advertisement created successfully!');
            }

            // Reset form
            setTitle('');
            setDescription('');
            setImage(null);
            setPreview(null);
            setEditingId(null);
            fetchAdvertisements();
            setActiveTab('list');
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Failed to process advertisement');
            if (error.response?.status === 401) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (id) => {
        try {
            const adToEdit = advertisements.find(ad => ad._id === id);
            if (adToEdit) {
                setTitle(adToEdit.title);
                setPreview(`data:image/jpeg;base64,${adToEdit.content}`);
                setImage(null); // Reset image since we don't need to upload unless changed
                setEditingId(id);
                setActiveTab('upload');
            }
        } catch (error) {
            console.error('Edit error:', error);
            toast.error('Failed to load advertisement for editing');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this advertisement?')) {
            try {
                await employeeApi.deleteAdvertisement(id);
                toast.success('Advertisement deleted successfully');
                fetchAdvertisements();
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Failed to delete advertisement');
                if (error.response?.status === 401) {
                    handleLogout();
                }
            }
        }
    };

    const fetchAdvertisementRequests = useCallback(async () => {
        setLoading(true);
        try {
            const response = await advertisementApi.getAllAdvertisements();
            setAdvertisementRequests(response.data);
        } catch (error) {
            console.error('Error fetching advertisement requests:', error);
            toast.error('Failed to fetch advertisement requests');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleUpdateAdvertisement = async (id, status) => {
        try {
            await advertisementApi.updateAdvertisement(id, { status });
            toast.success('Advertisement status updated successfully');
                fetchAdvertisementRequests();
        } catch (error) {
            console.error('Error updating advertisement status:', error);
            toast.error('Failed to update advertisement status');
        }
    };

    useEffect(() => {
        fetchAdvertisementRequests();
    }, [fetchAdvertisementRequests]);

    return (
        <PageContainer>
            <Sidebar>
                <SidebarTitle>Employee Dashboard</SidebarTitle>
                <NavButton 
                    active={activeTab === 'upload'} 
                    onClick={() => setActiveTab('upload')}
                >
                    <FaUpload /> Upload Advertisement
                </NavButton>
                <NavButton 
                    active={activeTab === 'list'} 
                    onClick={() => setActiveTab('list')}
                >
                    <FaList /> View Advertisements
                </NavButton>
                <NavButton 
                    active={activeTab === 'stats'} 
                    onClick={() => setActiveTab('stats')}
                >
                    <FaChartLine /> Statistics
                </NavButton>
                <LogoutButton onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                </LogoutButton>
            </Sidebar>

            <MainContent>
                <ToastContainer />
                
                {activeTab === 'upload' && (
                    <ContentSection>
                        <PageTitle>
                            {editingId ? 'Edit Advertisement' : 'Upload New Advertisement'}
                        </PageTitle>
                        <StyledForm onSubmit={handleSubmit} encType="multipart/form-data">
                            <FormGroup>
                                <StyledLabel>Title</StyledLabel>
                                <StyledInput
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    placeholder="Enter advertisement title"
                                />
                            </FormGroup>
                            <FormGroup>
                                <StyledLabel>Description</StyledLabel>
                                <StyledTextArea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    placeholder="Enter advertisement description"
                                />
                            </FormGroup>
                            <FormGroup>
                                <StyledLabel>Image</StyledLabel>
                                <StyledFileInput
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    required={!editingId}
                                />
                            </FormGroup>
                            {preview && (
                                <PreviewContainer>
                                    <PreviewImage src={preview} alt="Preview" />
                                </PreviewContainer>
                            )}
                            <SubmitButton type="submit" disabled={loading}>
                                {loading ? 'Processing...' : (editingId ? 'Update' : 'Upload')}
                            </SubmitButton>
                        </StyledForm>
                    </ContentSection>
                )}

                {activeTab === 'list' && (
                    <ContentSection>
                        <PageTitle>Advertisement List</PageTitle>
                        <Grid>
                            {advertisements.length > 0 ? (
                                advertisements.map((ad) => (
                                    <Card key={ad._id}>
                                        <CardImage 
                                            src={ad.content?.startsWith('/9j') 
                                                ? `data:image/jpeg;base64,${ad.content}`
                                                : ad.content 
                                                    ? `http://localhost:5000/uploads/${ad.content}`
                                                    : 'https://via.placeholder.com/400x300?text=Advertisement+Image'
                                            } 
                                            alt={ad.title} 
                                            onError={(e) => {
                                                console.error("Image load error for:", ad.content);
                                                e.target.src = 'https://via.placeholder.com/400x300?text=Advertisement+Image';
                                            }}
                                        />
                                        <CardContent>
                                            <CardTitle>{ad.title}</CardTitle>
                                            <CardDate>
                                                Posted: {new Date(ad.createdAt).toLocaleDateString()}
                                            </CardDate>
                                            <CardActions>
                                                <ActionButton onClick={() => handleEdit(ad._id)}>
                                                    <FaEdit /> Edit
                                                </ActionButton>
                                                <ActionButton 
                                                    onClick={() => handleDelete(ad._id)}
                                                    style={{ background: colors.error }}
                                                >
                                                    <FaTrash /> Delete
                                                </ActionButton>
                                            </CardActions>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <NoDataMessage>No advertisements found</NoDataMessage>
                            )}
                        </Grid>
                    </ContentSection>
                )}

                {activeTab === 'stats' && (
                    <ContentSection>
                        <PageTitle>Statistics & Analytics</PageTitle>
                        
                        <StatsGrid>
                            <StatCard>
                                <StatTitle>Total Advertisements</StatTitle>
                                <StatValue>{advertisements.length}</StatValue>
                            </StatCard>
                            <StatCard>
                                <StatTitle>Total Revenue</StatTitle>
                                <StatValue>$1,249.99</StatValue>
                            </StatCard>
                            <StatCard>
                                <StatTitle>Active Campaigns</StatTitle>
                                <StatValue>12</StatValue>
                            </StatCard>
                        </StatsGrid>

                        <ChartSection>
                            <ChartContainer>
                                <ChartTitle>Monthly Advertisements</ChartTitle>
                                <BarChart width={500} height={300} data={mockData.monthlyAds}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill={colors.accent} />
                                </BarChart>
                            </ChartContainer>

                            <ChartContainer>
                                <ChartTitle>Advertisement Performance</ChartTitle>
                                <PieChart width={400} height={300}>
                                    <Pie
                                        data={mockData.adPerformance}
                                        cx={200}
                                        cy={150}
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label
                                    >
                                        {mockData.adPerformance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ChartContainer>
                        </ChartSection>

                        <TransactionSection>
                            <ChartTitle>Recent Transactions</ChartTitle>
                            <TransactionTable>
                                <thead>
                                    <tr>
                                        <th>Transaction ID</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockData.transactions.map((tx) => (
                                        <tr key={tx.id}>
                                            <td>{tx.id}</td>
                                            <td>{new Date(tx.date).toLocaleDateString()}</td>
                                            <td>${tx.amount}</td>
                                            <td>
                                                <StatusBadge status={tx.status}>
                                                    {tx.status}
                                                </StatusBadge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </TransactionTable>
                        </TransactionSection>
                    </ContentSection>
                )}
            </MainContent>

            <RequestsSection>
                <h2>Advertisement Requests</h2>
                {loading ? (
                    <LoadingMessage>Loading requests...</LoadingMessage>
                ) : advertisementRequests.length === 0 ? (
                    <NoDataMessage>No advertisement requests found</NoDataMessage>
                ) : (
                    <RequestsGrid>
                        {advertisementRequests.map(request => (
                            <RequestCard key={request.id}>
                                <RequestImage 
                                    src={request.property?.imageUrls || 'https://via.placeholder.com/400x300?text=Property+Image'} 
                                    alt={request.property?.title || 'Property'}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x300?text=Property+Image';
                                    }}
                                />
                                <RequestInfo>
                                    <h3>{request.property?.title}</h3>
                                    <p>Seller: {request.property?.seller?.email}</p>
                                    <StatusBadge $status={request.status}>
                                        {request.status.toUpperCase()}
                                    </StatusBadge>
                                {request.status === 'pending' && (
                                        <ButtonGroup>
                                            <ApproveButton onClick={() => handleUpdateAdvertisement(request.id, 'approved')}>
                                            Approve
                                            </ApproveButton>
                                            <RejectButton onClick={() => handleUpdateAdvertisement(request.id, 'rejected')}>
                                            Reject
                                            </RejectButton>
                                        </ButtonGroup>
                                )}
                                </RequestInfo>
                            </RequestCard>
                        ))}
                    </RequestsGrid>
                )}
            </RequestsSection>
        </PageContainer>
    );
};

// Enhanced Styled Components
const PageContainer = styled.div`
    display: flex;
    min-height: 100vh;
    background: ${colors.background};
`;

const Sidebar = styled.div`
    width: 250px;
    background: ${colors.primary};
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const SidebarTitle = styled.h1`
    color: ${colors.white};
    font-size: 1.5rem;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid ${colors.white};
`;

const SectionTitle = styled.h2`
    color: ${colors.primary};
    font-size: 2rem;
    margin-bottom: 1.5rem;
    text-align: center;
    font-weight: 600;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid ${colors.accent}40;
`;

const NavButton = styled.button`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: ${props => props.active ? colors.accent : 'transparent'};
    color: ${colors.white};
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: ${colors.accent};
    }
`;

const LogoutButton = styled(NavButton)`
    margin-top: auto;
    background: ${colors.error};
    &:hover {
        background: ${colors.secondary};
    }
`;

const MainContent = styled.div`
    flex: 1;
    padding: 20px;
    overflow-y: auto;
`;

const ContentSection = styled.div`
    background: ${colors.white};
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const PageTitle = styled.h1`
    font-size: 2.5rem;
    color: ${colors.primary};
    margin-bottom: 30px;
    text-align: center;
    font-weight: 600;
`;

const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 25px;
    max-width: 600px;
    margin: 0 auto;
    padding: 30px;
    background: white;
    border-radius: 15px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const StyledLabel = styled.label`
    font-size: 1.2rem;
    color: ${colors.primary};
    font-weight: 500;
`;

const StyledInput = styled.input`
    padding: 15px;
    border: 2px solid ${colors.neutral}40;
    border-radius: 10px;
    font-size: 1.1rem;
    transition: all 0.3s ease;

    &:focus {
        border-color: ${colors.accent};
        box-shadow: 0 0 0 4px ${colors.accent}20;
        outline: none;
    }
`;

const StyledTextArea = styled.textarea`
    padding: 15px;
    border: 2px solid ${colors.neutral}40;
    border-radius: 10px;
    font-size: 1.1rem;
    transition: all 0.3s ease;

    &:focus {
        border-color: ${colors.accent};
        box-shadow: 0 0 0 4px ${colors.accent}20;
        outline: none;
    }
`;

const StyledFileInput = styled.input`
    padding: 12px;
    border: 2px dashed ${colors.neutral}40;
    border-radius: 10px;
    background: ${colors.background};
    cursor: pointer;
    font-size: 1.1rem;

    &:hover {
        border-color: ${colors.accent};
    }
`;

const PreviewContainer = styled.div`
    display: flex;
    justify-content: center;
    margin: 20px 0;
`;

const PreviewImage = styled.img`
    max-width: 100%;
    height: auto;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const SubmitButton = styled.button`
    padding: 12px;
    background: ${colors.accent};
    color: ${colors.white};
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: ${colors.primary};
    }

    &:disabled {
        background: ${colors.neutral};
        cursor: not-allowed;
    }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
`;

const Card = styled.div`
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;

    &:hover {
        transform: translateY(-5px);
    }
`;

const CardImage = styled.img`
    width: 100%;
    height: 250px;
    object-fit: cover;
`;

const CardContent = styled.div`
    padding: 20px;
`;

const CardTitle = styled.h3`
    font-size: 1.5rem;
    color: ${colors.primary};
    margin-bottom: 10px;
`;

const CardDate = styled.p`
    font-size: 1rem;
    color: ${colors.neutral};
    margin-bottom: 15px;
`;

const CardActions = styled.div`
    display: flex;
    gap: 15px;
    justify-content: flex-end;
`;

const ActionButton = styled.button`
    padding: 10px 20px;
    background: ${colors.accent};
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:hover {
        background: ${colors.primary};
        transform: translateY(-2px);
    }

    svg {
        font-size: 1.2rem;
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
`;

const StatCard = styled.div`
    background: ${colors.white};
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
`;

const StatTitle = styled.h3`
    color: ${colors.neutral};
    margin-bottom: 10px;
`;

const StatValue = styled.div`
    color: ${colors.primary};
    font-size: 2rem;
    font-weight: bold;
`;

const NoDataMessage = styled.p`
    text-align: center;
    color: ${colors.neutral};
    font-size: 1.2rem;
    grid-column: 1 / -1;
    padding: 20px;
`;

const ChartSection = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin: 30px 0;
    justify-content: center;
`;

const ChartContainer = styled.div`
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h3`
    color: ${colors.primary};
    margin-bottom: 20px;
    text-align: center;
    font-size: 1.2rem;
`;

const TransactionSection = styled.div`
    margin-top: 30px;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const TransactionTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;

    th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid ${colors.neutral}20;
    }

    th {
        background-color: ${colors.background};
        color: ${colors.primary};
        font-weight: 600;
    }

    tr:hover {
        background-color: ${colors.background};
    }
`;

const RequestsSection = styled.div`
    margin-top: 30px;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const RequestsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
`;

const RequestCard = styled.div`
    border: 1px solid ${colors.neutral}20;
    border-radius: 8px;
    overflow: hidden;
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const RequestImage = styled.img`
    width: 100%;
    height: 200px;
    object-fit: cover;
`;

const RequestInfo = styled.div`
    padding: 15px;

    h3 {
        color: ${colors.primary};
        margin-bottom: 10px;
    }

    p {
        color: ${colors.neutral};
        margin-bottom: 10px;
    }
`;

const StatusBadge = styled.span`
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    text-transform: uppercase;
    background: ${props => 
        props.$status === 'approved' ? colors.success :
        props.$status === 'rejected' ? colors.error :
        colors.warning};
    color: white;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 15px;
`;

const ApproveButton = styled.button`
    padding: 8px 16px;
    background: ${colors.success};
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
`;

const RejectButton = styled.button`
    padding: 8px 16px;
    background: ${colors.error};
        color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
`;

export default EmployeePage;