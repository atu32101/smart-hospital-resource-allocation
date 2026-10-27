package com.hospital.service;

import com.hospital.dto.DashboardStatsResponse;
import com.hospital.entity.Patient;
import com.hospital.repository.BedRepository;
import com.hospital.repository.EquipmentRepository;
import com.hospital.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

    private final PatientRepository patientRepository;
    private final BedRepository bedRepository;
    private final EquipmentRepository equipmentRepository;

    @Autowired
    public DashboardService(PatientRepository patientRepository,
                            BedRepository bedRepository,
                            EquipmentRepository equipmentRepository) {
        this.patientRepository = patientRepository;
        this.bedRepository = bedRepository;
        this.equipmentRepository = equipmentRepository;
    }

    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        // Patient counts
        stats.setTotalPatients(patientRepository.count());
        stats.setAdmittedPatients(patientRepository.countByStatus("ADMITTED"));
        stats.setWaitingPatients(patientRepository.countByStatus("WAITING"));
        stats.setDischargedPatients(patientRepository.countByStatus("DISCHARGED"));

        // Bed counts
        stats.setTotalBeds(bedRepository.count());
        stats.setAvailableBeds(bedRepository.countByStatus("AVAILABLE"));
        stats.setOccupiedBeds(bedRepository.countByStatus("OCCUPIED"));

        // Equipment counts
        stats.setTotalEquipment(equipmentRepository.count());
        stats.setAvailableEquipment(equipmentRepository.countByStatus("AVAILABLE"));
        stats.setAllocatedEquipment(equipmentRepository.countByStatus("ALLOCATED"));

        // Bed breakdown by type
        stats.setGeneralAvailable(bedRepository.countByBedTypeAndStatus("GENERAL", "AVAILABLE"));
        stats.setGeneralOccupied(bedRepository.countByBedTypeAndStatus("GENERAL", "OCCUPIED"));
        stats.setPrivateAvailable(bedRepository.countByBedTypeAndStatus("PRIVATE", "AVAILABLE"));
        stats.setPrivateOccupied(bedRepository.countByBedTypeAndStatus("PRIVATE", "OCCUPIED"));
        stats.setIcuAvailable(bedRepository.countByBedTypeAndStatus("ICU", "AVAILABLE"));
        stats.setIcuOccupied(bedRepository.countByBedTypeAndStatus("ICU", "OCCUPIED"));

        // Priority breakdown for active/waiting patients
        List<Patient> allPatients = patientRepository.findAll();
        long critical = 0, high = 0, medium = 0, low = 0;
        for (Patient p : allPatients) {
            String pri = p.getPriority() != null ? p.getPriority().toUpperCase() : "";
            switch (pri) {
                case "CRITICAL" -> critical++;
                case "HIGH" -> high++;
                case "MEDIUM" -> medium++;
                case "LOW" -> low++;
            }
        }
        stats.setCriticalCount(critical);
        stats.setHighCount(high);
        stats.setMediumCount(medium);
        stats.setLowCount(low);

        return stats;
    }
}
