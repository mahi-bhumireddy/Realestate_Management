package com.property.propertymanagement.repository;

import com.property.propertymanagement.model.Advertisement;
import com.property.propertymanagement.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdvertisementRepository extends JpaRepository<Advertisement, Long> {
    List<Advertisement> findByProperty(Property property);
    List<Advertisement> findByStatus(String status);
    List<Advertisement> findByEndDateBefore(LocalDateTime date);
    List<Advertisement> findByStartDateAfter(LocalDateTime date);
    
    @Query("SELECT a FROM Advertisement a WHERE a.property.seller.id = :sellerId")
    List<Advertisement> findByPropertySellerId(@Param("sellerId") Long sellerId);
} 