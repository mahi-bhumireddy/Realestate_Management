import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaHome, FaRegClock, FaUser, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { advertisementApi } from '../services/ApiService';
import { colors, LoadingMessage } from '../styles/commonStyles';

const PageContainer = styled.div`
    padding: 20px;
    font-family: Arial, sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    font-size: 16px;
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: 40px;
    padding: 20px;

    h1 {
        font-size: 4rem;
        color: #2c3e50;
        margin-bottom: 20px;
        font-weight: bold;
    }

    p {
        font-size: 2rem;
        color: #34495e;
        line-height: 1.6;
    }
`;

const AdvertisementsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 35px;
    padding: 20px;
`;

const AdCard = styled.div`
    border: 1px solid #ddd;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;

    &:hover {
        transform: translateY(-5px);
    }

    img {
        width: 100%;
        height: 300px;
        object-fit: cover;
        display: block;
    }

    h2 {
        font-size: 2.5rem;
        margin: 20px;
        color: #2c3e50;
        font-weight: bold;
    }

    p {
        font-size: 1.8rem;
        margin: 20px;
        color: #34495e;
        line-height: 1.8;
    }

    .price {
        font-size: 2.4rem;
        font-weight: bold;
        color: #2980b9;
        margin: 20px;
    }

    .property-details {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        padding: 15px;
        border-top: 1px solid #eee;
        font-size: 1.6rem;
        background-color: #f9f9f9;
        border-radius: 8px;
    }

    .detail-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;

        svg {
            color: #2980b9;
            font-size: 1.8rem;
        }
    }
`;

const ContactInfo = styled.div`
    display: flex;
    gap: 20px;
    padding: 15px 20px;
    border-top: 1px solid #eee;
    
    .contact-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 1.6rem;
        color: #2980b9;
        
        svg {
            font-size: 1.8rem;
        }
    }
`;

const TimeStamp = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.4rem;
    color: #7f8c8d;
    padding: 0 20px;

    svg {
        font-size: 1.6rem;
    }
`;

const AdvertisementPage = () => {
    const [advertisements, setAdvertisements] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAdvertisements();
    }, []);

    const fetchAdvertisements = async () => {
        setLoading(true);
        try {
            const response = await advertisementApi.getActiveAdvertisements();
            setAdvertisements(response.data);
        } catch (error) {
            console.error("Error fetching advertisements:", error);
            toast.error("Failed to fetch advertisements");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingMessage>Loading advertisements...</LoadingMessage>;
    }

    return (
        <PageContainer>
            <Header>
                <h1>Premium Properties</h1>
                <p>Discover extraordinary homes and exclusive real estate opportunities</p>
            </Header>

            <AdvertisementsGrid>
                {advertisements.map(ad => (
                    <AdCard key={ad.id}>
                        <img 
                            src={ad.property?.imageUrls || 'https://via.placeholder.com/400x300?text=Property+Image'} 
                            alt={ad.property?.title || 'Property'} 
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x300?text=Property+Image';
                            }}
                        />
                        <h2>{ad.property?.title}</h2>
                        <div className="detail-item">
                            <FaMapMarkerAlt />
                            <span>{ad.property?.location}</span>
                        </div>
                        <p>{ad.property?.description}</p>
                        <div className="property-details">
                            <div className="detail-item">
                                <FaBed />
                                <span>{ad.property?.bedrooms} Beds</span>
                            </div>
                            <div className="detail-item">
                                <FaBath />
                                <span>{ad.property?.bathrooms} Baths</span>
                            </div>
                            <div className="detail-item">
                                <FaRulerCombined />
                                <span>{ad.property?.squareFeet} sqft</span>
                            </div>
                            <div className="detail-item">
                                <FaHome />
                                <span>{ad.property?.type}</span>
                            </div>
                        </div>
                        <TimeStamp>
                            <FaRegClock />
                            <span>Posted {new Date(ad.createdAt).toLocaleDateString()}</span>
                        </TimeStamp>
                        <ContactInfo>
                            <div className="contact-item">
                                <FaUser />
                                <span>{ad.property?.seller?.name || 'Agent'}</span>
                            </div>
                            <div className="contact-item">
                                <FaEnvelope />
                                <span>{ad.property?.seller?.email || 'Contact'}</span>
                            </div>
                        </ContactInfo>
                        <p className="price">Price: ${ad.property?.price?.toLocaleString()}</p>
                    </AdCard>
                ))}
            </AdvertisementsGrid>
        </PageContainer>
    );
};

export default AdvertisementPage;
