package com.hospital.repository;

import com.hospital.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findByStatus(String status);
    List<Patient> findByNameContainingIgnoreCase(String name);
    long countByStatus(String status);

    // Fetch waiting patients sorted by priority score: CRITICAL (4), HIGH (3), MEDIUM (2), LOW (1)
    @Query("SELECT p FROM Patient p WHERE p.status = 'WAITING' ORDER BY " +
           "CASE p.priority " +
           "  WHEN 'CRITICAL' THEN 1 " +
           "  WHEN 'HIGH' THEN 2 " +
           "  WHEN 'MEDIUM' THEN 3 " +
           "  WHEN 'LOW' THEN 4 " +
           "  ELSE 5 END ASC, p.admissionDate ASC")
    List<Patient> findWaitingPatientsOrderedByPriority();
}
