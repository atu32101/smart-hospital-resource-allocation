package com.hospital.service;

import com.hospital.entity.Patient;
import com.hospital.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    @Autowired
    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    public List<Patient> getWaitingPatients() {
        return patientRepository.findWaitingPatientsOrderedByPriority();
    }

    public List<Patient> searchPatients(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllPatients();
        }
        return patientRepository.findByNameContainingIgnoreCase(keyword.trim());
    }

    @Transactional
    public Patient createPatient(Patient patient) {
        validatePatient(patient);
        if (patient.getStatus() == null || patient.getStatus().isBlank()) {
            patient.setStatus("WAITING");
        }
        return patientRepository.save(patient);
    }

    @Transactional
    public Patient updatePatient(Long id, Patient updated) {
        Patient existing = patientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Patient with ID " + id + " not found"));

        validatePatient(updated);

        existing.setName(updated.getName().trim());
        existing.setAge(updated.getAge());
        existing.setGender(updated.getGender());
        existing.setPhone(updated.getPhone() != null ? updated.getPhone().trim() : null);
        existing.setSymptoms(updated.getSymptoms() != null ? updated.getSymptoms().trim() : null);
        existing.setPriority(updated.getPriority().toUpperCase());
        existing.setRequiredBedType(updated.getRequiredBedType().toUpperCase());
        if (updated.getStatus() != null && !updated.getStatus().isBlank()) {
            existing.setStatus(updated.getStatus().toUpperCase());
        }

        return patientRepository.save(existing);
    }

    @Transactional
    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Patient with ID " + id + " not found"));

        if ("ADMITTED".equalsIgnoreCase(patient.getStatus())) {
            throw new IllegalStateException("Cannot delete an admitted patient. Please discharge the patient first.");
        }

        patientRepository.delete(patient);
    }

    private void validatePatient(Patient patient) {
        if (patient.getName() == null || patient.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Patient name cannot be empty");
        }
        if (patient.getAge() == null || patient.getAge() < 0 || patient.getAge() > 120) {
            throw new IllegalArgumentException("Patient age must be between 0 and 120");
        }
        if (patient.getGender() == null || patient.getGender().trim().isEmpty()) {
            throw new IllegalArgumentException("Gender is required");
        }
        if (patient.getPriority() == null || patient.getPriority().trim().isEmpty()) {
            throw new IllegalArgumentException("Priority is required (CRITICAL, HIGH, MEDIUM, LOW)");
        }
        if (patient.getRequiredBedType() == null || patient.getRequiredBedType().trim().isEmpty()) {
            throw new IllegalArgumentException("Required bed type is required (GENERAL, PRIVATE, ICU)");
        }

        String priority = patient.getPriority().toUpperCase();
        if (!priority.equals("CRITICAL") && !priority.equals("HIGH") && !priority.equals("MEDIUM") && !priority.equals("LOW")) {
            throw new IllegalArgumentException("Priority must be one of: CRITICAL, HIGH, MEDIUM, LOW");
        }

        String bedType = patient.getRequiredBedType().toUpperCase();
        if (!bedType.equals("GENERAL") && !bedType.equals("PRIVATE") && !bedType.equals("ICU")) {
            throw new IllegalArgumentException("Bed type must be one of: GENERAL, PRIVATE, ICU");
        }

        if (patient.getPhone() != null && !patient.getPhone().isBlank()) {
            String digits = patient.getPhone().replaceAll("[^0-9]", "");
            if (digits.length() < 7 || digits.length() > 15) {
                throw new IllegalArgumentException("Phone number must contain between 7 and 15 digits");
            }
        }
    }
}
