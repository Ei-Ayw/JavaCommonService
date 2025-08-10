package com.ayw.commomservice.controller;


import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health")
@Slf4j
public class HealthController {

    /**
     * 健康检查
     * @return
     */
    @GetMapping("/")
    public String health() {
        log.info("health check");
        return "ok";
    }
}
