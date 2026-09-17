package com.helpinghands.bootstrap;

import com.helpinghands.entity.EmergencyResponder;
import com.helpinghands.entity.User;
import com.helpinghands.entity.enums.AvailabilityStatus;
import com.helpinghands.entity.enums.Role;
import com.helpinghands.entity.enums.ServiceType;
import com.helpinghands.repository.EmergencyResponderRepository;
import com.helpinghands.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Seeds the prototype's demo accounts on startup so the app is testable immediately.
 * Idempotent: an account is created only if its email does not already exist.
 * Disable in production with helpinghands.seed.accounts=false.
 *
 * Demo credentials (password for all): demo123
 *   user@helpinghands.demo        (USER)
 *   responder@helpinghands.demo   (RESPONDER · AMBULANCE)
 *   admin@helpinghands.demo       (ADMIN)
 * Plus a POLICE and a FIRE_DEPARTMENT responder to exercise every service path.
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class DemoAccountSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EmergencyResponderRepository responderRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${helpinghands.seed.accounts:true}")
    private boolean seedAccounts;

    @Value("${helpinghands.seed.demo-password:demo123}")
    private String demoPassword;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedAccounts) {
            return;
        }
        ensureUser("Demo User", "user@helpinghands.demo", "+91 98765 10001", Role.USER);
        ensureUser("System Admin", "admin@helpinghands.demo", "+91 98765 30001", Role.ADMIN);

        ensureResponder("Demo Responder", "responder@helpinghands.demo", "+91 98765 20001",
                ServiceType.AMBULANCE, "City Hospital EMS · Unit 12",
                new BigDecimal("26.856000"), new BigDecimal("80.943000"), AvailabilityStatus.AVAILABLE);
        ensureResponder("Insp. Arjun Mehra", "arjun.mehra@police.example", "+91 98765 20002",
                ServiceType.POLICE, "Traffic Police · Zone 7",
                new BigDecimal("26.838000"), new BigDecimal("80.921000"), AvailabilityStatus.AVAILABLE);
        ensureResponder("Stn. Officer Kavita Rao", "kavita.rao@fire.example", "+91 98765 20003",
                ServiceType.FIRE_DEPARTMENT, "Fire Station 3 · Alambagh",
                new BigDecimal("26.809000"), new BigDecimal("80.902000"), AvailabilityStatus.ON_CALL);

        log.info("Demo accounts ensured. Login with any *.demo email and password '{}'.", demoPassword);
    }

    private User ensureUser(String name, String email, String phone, Role role) {
        return userRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
            User u = userRepository.save(User.builder()
                    .name(name).email(email).phone(phone)
                    .passwordHash(passwordEncoder.encode(demoPassword))
                    .role(role).active(true)
                    .build());
            log.info("Seeded {} account: {}", role, email);
            return u;
        });
    }

    private void ensureResponder(String name, String email, String phone, ServiceType dept,
                                 String unit, BigDecimal lat, BigDecimal lng, AvailabilityStatus avail) {
        User user = ensureUser(name, email, phone, Role.RESPONDER);
        if (responderRepository.findByUserId(user.getId()).isEmpty()) {
            responderRepository.save(EmergencyResponder.builder()
                    .user(user).name(name).email(email).phone(phone)
                    .department(dept).unitName(unit)
                    .baseLatitude(lat).baseLongitude(lng)
                    .availabilityStatus(avail)
                    .build());
            log.info("Seeded responder profile: {} ({})", email, dept);
        }
    }
}
