package com.hospital.repository;

import com.hospital.entity.Allocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AllocationRepository extends JpaRepository<Allocation, Long> {
    List<Allocation> findAllByOrderByIdDesc();
    List<Allocation> findByStatusOrderByIdDesc(String status);
    Optional<Allocation> findByPatientIdAndStatus(Long patientId, String status);
    Optional<Allocation> findByBedIdAndStatus(Long bedId, String status);
}
