/*
 * APITable <https://github.com/apitable/apitable>
 * Copyright (C) 2022 APITable Ltd. <https://apitable.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package com.apitable.shared.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

/**
 * Redis连接信息日志配置
 */
@Configuration
@Slf4j
public class RedisLoggingConfig {

    @Value("${spring.data.redis.host:127.0.0.1}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    @Value("${spring.data.redis.database:0}")
    private int redisDb;

    @Value("${spring.data.redis.username:}")
    private String redisUsername;

    @Value("${spring.data.redis.password:}")
    private String redisPassword;

    @Value("${spring.data.redis.ssl.enabled:false}")
    private boolean sslEnabled;

    /**
     * 启动时打印Redis连接信息
     */
    @Bean
    public CommandLineRunner logRedisConnectionInfo(RedisConnectionFactory connectionFactory,
                                                   RedisTemplate<String, Object> redisTemplate) {
        return args -> {
            log.info("========== Redis Connection Info ==========");
            log.info("Redis Host: {}", redisHost);
            log.info("Redis Port: {}", redisPort);
            log.info("Redis Database: {}", redisDb);
            log.info("Redis Username: {}", redisUsername.isEmpty() ? "not set" : "configured");
            log.info("Redis Password: {}", redisPassword.isEmpty() ? "not set" : "configured");
            log.info("Redis SSL Enabled: {}", sslEnabled);
            log.info("Redis Connection Factory Class: {}", connectionFactory.getClass().getName());
            log.info("Redis Connection Factory Instance: {}", connectionFactory);
            try {
                String pingResult = redisTemplate.getConnectionFactory().getConnection().ping();
                log.info("Redis Ping Test: {}", pingResult);
                log.info("Redis Connection Status: SUCCESS");
            } catch (Exception e) {
                log.error("Redis Connection Failed. Error: {}", e.getMessage(), e);
                log.error("Redis Connection Status: FAILED");
                log.error("Please check your Redis configuration and ensure Redis server is running.");
                log.error("Connection Details: redis://{}:{}@{}:{}/{}",
                         redisUsername.isEmpty() ? "" : redisUsername,
                         redisPassword.isEmpty() ? "" : "******",
                         redisHost,
                         redisPort,
                         redisDb);
            }
            log.info("==========================================");
        };
    }
}