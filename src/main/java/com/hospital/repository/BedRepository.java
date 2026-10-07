package com.hospital.repository;

import com.hospital.entity.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {
    Optional<Bed> findByBedNumber(String bedNumber);
    boolean existsByBedNumber(String bedNumber);
    List<Bed> findByStatus(String status);
    List<Bed> findByBedTypeAndStatus(String bedType, String status);
    List<Bed> findByBedType(String bedType);
    long countByStatus(String status);
    long countByBedTypeAndStatus(String bedType, String status);
}
