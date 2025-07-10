import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FaHeart, FaRegHeart, FaSignOutAlt, FaShoppingCart, FaMapMarkerAlt, FaRupeeSign, FaInfoCircle, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';
import { colors, LoadingMessage } from '../styles/commonStyles';
import { logoutUser } from '../redux/slices/authSlice';
import { propertyApi, buyerApi } from '../services/ApiService';
import { toast } from 'react-hot-toast';
import authService from '../services/AuthService';
import estateAgent from '../assets/estate-agent.png';
import house from '../assets/house.png';
import property from '../assets/property.png';
import search from '../assets/search.png';
import { FaHome, FaStar, FaBed, FaBath, FaRuler } from 'react-icons/fa';

// Styled components
const PageWrapper = styled.div`
  background-color: ${colors.background};
  min-height: 100vh;
  padding: 2rem;
  position: relative;
  overflow: hidden;
`;

const BackgroundImage = styled.img`
  position: absolute;
  opacity: 0.4;
  z-index: 0;
  width: 29%;
  height: 45%;
  ${({ position }) => position}: 0;
  ${({ size }) => size}: 150px;
`;

const Container = styled.div`
  min-width: 100vh;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
`;

const Heading = styled.h1`
  color: ${colors.primary};
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const StyledHeading = styled.h2`
  color: ${colors.primary};
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  svg {
    color: ${colors.secondary};
    font-size: 2.2rem;
  }

  animation: fadeIn 0.5s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const TabButton = styled.button`
  padding: 8px 16px;
  margin: 0 8px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  background: ${props => props.$active ? colors.primary : colors.neutral};
  color: ${props => props.$active ? 'white' : '#333'};

  &:hover {
    background: ${props => props.$active ? colors.secondary : colors.accent};
  }
`;

const FilterButton = styled.button`
  padding: 12px 24px;
  background: ${props => props.$variant === 'clear' ? colors.neutral : colors.accent};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  width: 100%;

  &:hover {
    background: ${props => props.$variant === 'clear' ? colors.neutral : colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const FilterSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
`;

const FilterTitle = styled.h3`
  color: ${colors.primary};
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
`;

const Input = styled.input`
  padding: 12px;
  border: 1.5px solid ${colors.border};
  border-radius: 8px;
  font-size: 1rem;
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
  border: 1.5px solid ${colors.border};
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  transition: all 0.3s ease;
  background-color: white;

  &:focus {
    border-color: ${colors.accent};
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    outline: none;
  }
`;

const PropertyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  padding: 20px;
`;

const PropertyCard = styled.div`
  position: relative;
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  padding: 25px;
  margin-bottom: 25px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border: 1px solid rgba(0,0,0,0.05);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.15);
    border-color: ${colors.accent}40;
  }

  img {
    width: 100%;
    height: 250px !important;
    object-fit: cover;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

const PropertyTitle = styled.h3`
  color: ${colors.primary};
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const PropertyDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PropertyInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${colors.text};
  font-size: 1rem;

  svg {
    color: ${colors.accent};
  }
`;

const BuyButton = styled.button`
  padding: 12px 24px;
  background: ${colors.accent};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;

  &:hover {
    background: ${colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 1.2rem;
  }
`;

const LogoutButton = styled.button`
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 12px 24px;
  background: ${colors.accent};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 10;

  &:hover {
    background: ${colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 1.2rem;
  }
`;

const NoProperties = styled.div`
  text-align: center;
  font-size: 1.5rem;
  color: ${colors.primary};
  margin-top: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
`;

const StatusBadge = styled.span`
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  color: white;
  background: ${props =>
    props.$status === 'available' ? `${colors.primary}` :
    props.$status === 'pending' ? `${colors.secondary}` :
    `${colors.accent}`};
`;

const FavoriteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$isFavorite ? colors.secondary : 'white'};
  border: 2px solid ${props => props.$isFavorite ? colors.secondary : '#ccc'};
  z-index: 2;

  &:hover {
    background: ${props => props.$isFavorite ? colors.secondary : '#f8f8f8'};
  }

  svg {
    width: 20px;
    height: 20px;
    color: ${props => props.$isFavorite ? 'white' : colors.secondary};
  }
`;

const BuyerPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('available');
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [purchasedProperties, setPurchasedProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    title: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    propertyType: '',
    minBedrooms: '',
  });

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      // Always fetch favorites for the heart icons
      const favResponse = await buyerApi.getFavorites();
      setFavorites(favResponse.data);

      // Fetch properties based on active tab
      let response;
      switch (activeTab) {
        case 'favorites':
          setProperties(favResponse.data);
          break;
        case 'purchased':
          response = await buyerApi.getPurchasedProperties();
          setPurchasedProperties(response.data);
          break;
        default:
          response = await propertyApi.getAllProperties();
          setProperties(response.data);
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    // Extract unique locations from properties
    if (properties.length > 0) {
      const uniqueLocations = [...new Set(properties.map(p => p.location))].filter(Boolean);
      setLocations(uniqueLocations);
    }
  }, [properties]);

  const toggleFavorite = async (propertyId) => {
    try {
      if (favorites.some(fav => fav.id === propertyId)) {
        await buyerApi.removeFromFavorites(propertyId);
        setFavorites(favorites.filter(fav => fav.id !== propertyId));
        toast.success('Removed from favorites');
      } else {
        await buyerApi.addToFavorites(propertyId);
        const property = properties.find(p => p.id === propertyId);
        setFavorites([...favorites, property]);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const handlePurchase = async (propertyId, price, title) => {
    // TODO: Implement purchase functionality
    toast.info('Purchase functionality coming soon!');
  };

  const handleFilterSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Remove empty filter values
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await propertyApi.searchProperties(cleanFilters);
      setProperties(response.data);
    } catch (error) {
      console.error('Error applying filters:', error);
      toast.error('Failed to apply filters');
        } finally {
          setLoading(false);
        }
  }, [filters]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    dispatch(logoutUser());
    navigate('/');
  };

  const clearFilters = useCallback(() => {
    setFilters({
      title: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      propertyType: '',
      minBedrooms: '',
    });
    fetchInitialData();
  }, [fetchInitialData]);

  const renderProperties = () => {
    const propertiesToShow = activeTab === 'favorites' 
      ? favorites 
      : activeTab === 'purchased' 
        ? purchasedProperties 
        : properties;

    if (propertiesToShow.length === 0) {
      return (
        <NoProperties>
          No properties found
        </NoProperties>
      );
    }

    return (
      <PropertyGrid>
        {propertiesToShow.map((property) => (
          <PropertyCard key={property.id}>
            <StatusBadge $status={property.status}>{property.status}</StatusBadge>
            
              <FavoriteButton 
              $isFavorite={favorites.some(fav => fav.id === property.id)}
                onClick={(e) => {
                  e.stopPropagation();
                toggleFavorite(property.id);
                }}
              >
              {favorites.some(fav => fav.id === property.id) ? <FaHeart /> : <FaRegHeart />}
              </FavoriteButton>

            {property.imageUrls && (
              <img
                src={property.imageUrls}
                alt={property.title}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}
              />
            )}
            
            <PropertyDetails>
              <PropertyTitle>
                {property.title || 'Untitled Property'}
              </PropertyTitle>
              
              <PropertyInfo>
                <FaMapMarkerAlt />
                <span><strong>Location:</strong> {property.location || 'Not available'}</span>
              </PropertyInfo>
              
              <PropertyInfo>
                <FaRupeeSign />
                <span><strong>Price:</strong> {property.price ? `₹${property.price.toLocaleString()}` : 'Price not available'}</span>
              </PropertyInfo>
              
              <PropertyInfo>
                <FaInfoCircle />
                <span><strong>Description:</strong> {property.description || 'No description provided'}</span>
              </PropertyInfo>
              
              <PropertyInfo>
                <FaEnvelope />
                <span><strong>Contact:</strong> {property.seller?.email || 'Email not provided'}</span>
              </PropertyInfo>
              
              <PropertyInfo>
                <FaCalendarAlt />
                <span><strong>Listed on:</strong> {property.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'Not available'}</span>
              </PropertyInfo>
              
              {property.status === 'available' && activeTab !== 'purchased' && (
                <BuyButton 
                  onClick={() => handlePurchase(
                    property.id,
                    property.price,
                    property.title
                  )}
                >
                  <FaShoppingCart /> Buy Property
                </BuyButton>
              )}
            </PropertyDetails>
          </PropertyCard>
        ))}
      </PropertyGrid>
    );
  };

  return (
    <PageWrapper>

      <BackgroundImage src={estateAgent} position="top" size="left" />
      <BackgroundImage src={house} position="bottom" size="right" />
      <BackgroundImage src={property} position="top" size="right" />
      <BackgroundImage src={search} position="bottom" size="left" />

      <LogoutButton onClick={handleLogout}>
        <FaSignOutAlt />
        Logout
      </LogoutButton>
      <Container>
        <Heading>Estate Craft Properties</Heading>
        <StyledHeading>
          <FaStar />
          ...Find your dream home with us....
          <FaHome />
        </StyledHeading>
        <TabContainer>
          <TabButton 
            $active={activeTab === 'available'} 
            onClick={() => setActiveTab('available')}
          >
            Available Properties
          </TabButton>
          <TabButton 
            $active={activeTab === 'favorites'} 
            onClick={() => setActiveTab('favorites')}
          >
            Favorites
          </TabButton>
          <TabButton 
            $active={activeTab === 'purchased'} 
            onClick={() => setActiveTab('purchased')}
          >
            Purchased
          </TabButton>
        </TabContainer>

        {activeTab === 'available' && (
          <FilterSection>
            <FilterTitle>Filter Properties</FilterTitle>
            <form onSubmit={handleFilterSubmit}>
              <FilterGrid>
                <Input
                  type="text"
                  name="title"
                  placeholder="Search by title"
                  value={filters.title}
                  onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                />
                <Input
                  type="number"
                  name="minPrice"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  min="0"
                />
                <Input
                  type="number"
                  name="maxPrice"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  min="0"
                />
                <Input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
                <Select
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                >
                  <option value="">All Property Types</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="land">Land</option>
                </Select>
                <Input
                  type="number"
                  name="minBedrooms"
                  placeholder="Min Bedrooms"
                  value={filters.minBedrooms}
                  onChange={(e) => setFilters({ ...filters, minBedrooms: e.target.value })}
                  min="0"
                />
                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                  <FilterButton type="submit" $variant="apply">Apply Filters</FilterButton>
                  <FilterButton type="button" onClick={clearFilters} $variant="clear">Clear Filters</FilterButton>
                </div>
              </FilterGrid>
            </form>
          </FilterSection>
        )}
        {loading ? (
          <LoadingMessage>Loading properties...</LoadingMessage>
        ) : (
          renderProperties()
        )}
      </Container>
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          © 2024 Real Estate Portal | All rights reserved
        </div>
      </footer>
    </PageWrapper>
  );
};

export default BuyerPage;

// Inline CSS styles
const styles = {
  page: {
    backgroundColor: colors.background,
    minHeight: '100vh',
    padding: '2rem',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  propertyCard: {
    backgroundColor: colors.cardBg,
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
    transition: 'transform 0.3s ease',
    padding: '1.5rem',
    cursor: 'pointer',
  },
  heading: {
    color: colors.primary,
    fontSize: '2.5rem',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  filterSection: {
    backgroundColor: colors.cardBg,
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  },
  footer: {
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    textAlign: 'center',
    color: '#333',
    fontSize: '0.9rem',
  }, 
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  noProperties: {
    textAlign: 'center',
    fontSize: '1.5rem',
    color: colors.primary,
    marginTop: '2rem',
  },
};