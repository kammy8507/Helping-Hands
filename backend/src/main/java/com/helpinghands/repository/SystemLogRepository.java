package com.helpinghands.repository;

import com.helpinghands.entity.SystemLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {

    List<SystemLog> findAllByOrderByTimestampDesc();

    Page<SystemLog> findAllByOrderByTimestampDesc(Pageable pageable);
}
