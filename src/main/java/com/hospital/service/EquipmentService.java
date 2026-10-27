package com.hospital.service;

import com.hospital.entity.Equipment;
import com.hospital.entity.Patient;
import com.hospital.repository.EquipmentRepository;
import com.hospital.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final PatientRepository patientRepository;

    @Autowired
    public EquipmentService(EquipmentRepository equipmentRepository, PatientRepository patientRepository) {
        this.equipmentRepository = equipmentRepository;
        this.patientRepository = patientRepository;
    }

    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    public List<Equipment> getAvailableEquipment() {
        return equipmentRepository.findByStatus("AVAILABLE");
    }

    public Optional<Equipment> getEquipmentById(Long id) {
        return equipmentRepository.findById(id);
    }

    public List<Equipment> filterEquipment(String type, String status) {
        boolean hasType = type != null && !type.isBlank() && !"ALL".equalsIgnoreCase(type);
        boolean hasStatus = status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status);

        if (hasType && hasStatus) {
            return equipmentRepository.findByTypeAndStatus(type.toUpperCase(), status.toUpperCase());
        } else if (hasType) {
            return equipmentRepository.findByType(type.toUpperCase());
        } else if (hasStatus) {
            return equipmentRepository.findByStatus(status.toUpperCase());
        } else {
            return equipmentRepository.findAll();
        }
    }

    @Transactional
    public Equipment createEquipment(Equipment equipment) {
        if (equipment.getName() == null || equipment.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Equipment name cannot be empty");
        }
        if (equipment.getType() == null || equipment.getType().trim().isEmpty()) {
            throw new IllegalArgumentException("Equipment type is required");
        }
        equipment.setName(equipment.getName().trim());
        equipment.setType(equipment.getType().trim().toUpperCase());
        if (equipment.getStatus() == null || equipment.getStatus().isBlank()) {
            equipment.setStatus("AVAILABLE");
        }
        return equipmentRepository.save(equipment);
    }

    @Transactional
    public Equipment allocateEquipment(Long equipmentId, Long patientId) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found with ID: " + equipmentId));

        if ("ALLOCATED".equalsIgnoreCase(equipment.getStatus())) {
            throw new IllegalStateException("Equipment '" + equipment.getName() + "' is already allocated to another patient.");
        }

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with ID: " + patientId));

        if ("DISCHARGED".equalsIgnoreCase(patient.getStatus())) {
            throw new IllegalStateException("Cannot allocate equipment to a discharged patient.");
        }

        equipment.setStatus("ALLOCATED");
        equipment.setPatient(patient);
        equipment.setAllocationDate(LocalDateTime.now());
        return equipmentRepository.save(equipment);
    }

    @Transactional
    public Equipment releaseEquipment(Long equipmentId) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found with ID: " + equipmentId));

        equipment.setStatus("AVAILABLE");
        equipment.setPatient(null);
        equipment.setAllocationDate(null);
        return equipmentRepository.save(equipment);
    }

    @Transactional
    public void releaseAllForPatient(Long patientId) {
        List<Equipment> allocated = equipmentRepository.findByPatientId(patientId);
        for (Equipment eq : allocated) {
            eq.setStatus("AVAILABLE");
            eq.setPatient(null);
            eq.setAllocationDate(null);
            equipmentRepository.save(eq);
        }
    }

    @Transactional
    public void deleteEquipment(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found with ID: " + id));

        if ("ALLOCATED".equalsIgnoreCase(equipment.getStatus()) || equipment.getPatient() != null) {
            throw new IllegalStateException("Cannot delete equipment currently allocated to a patient. Please release it first.");
        }

        equipmentRepository.delete(equipment);
    }
}
