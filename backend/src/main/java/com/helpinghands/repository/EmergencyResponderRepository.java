package com.helpinghands.repository;

import com.helpinghands.entity.EmergencyResponder;
import com.helpinghands.entity.enums.AvailabilityStatus;
import com.helpinghands.entity.enums.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmergencyResponderRepository extends JpaRepository<EmergencyResponder, Long> {

    Optional<EmergencyResponder> findByUserId(Long userId);

    List<EmergencyResponder> findByDepartment(ServiceType department);

    List<EmergencyResponder> findByDepartmentAndAvailabilityStatusIn(
            ServiceType department, Collection<AvailabilityStatus> statuses);

    long countByAvailabilityStatus(AvailabilityStatus status);
}
