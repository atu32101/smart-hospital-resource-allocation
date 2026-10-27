package com.hospital.repository;

import com.hospital.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByStatus(String status);
    List<Equipment> findByType(String type);
    List<Equipment> findByTypeAndStatus(String type, String status);
    List<Equipment> findByPatientId(Long patientId);
    long countByStatus(String status);
}
