package ben.chatanon.service;

import org.apache.commons.text.RandomStringGenerator;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

import java.security.SecureRandom;

@Service
public class CaptchaService {

    // 定义全局安全随机数生成器
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public String generateText() {
        RandomStringGenerator generator = new RandomStringGenerator.Builder()
                .withinRange('0', 'z')                                         // 指定范围
                .usingRandom(SECURE_RANDOM::nextInt)
                .build();
        return generator.generate(4); // 生成4位验证码
    }

    public String generateImageBase64(String text) {
        BufferedImage image = new BufferedImage(100, 40, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2 = image.createGraphics();
        g2.setColor(Color.WHITE);
        g2.fillRect(0, 0, 100, 40);
        g2.setColor(Color.BLACK);
        g2.setFont(new Font("Arial", Font.BOLD, 24));
        g2.drawString(text, 15, 28);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            ImageIO.write(image, "png", baos);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(baos.toByteArray());
    }
}
