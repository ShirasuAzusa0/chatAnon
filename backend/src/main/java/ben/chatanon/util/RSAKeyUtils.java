package ben.chatanon.util;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Component
public class RSAKeyUtils {
    private PrivateKey privateKey;
    private PublicKey publicKey;

    // 生成RSA密钥对（2048位）
    public static KeyPair generateKeyPair()  throws NoSuchAlgorithmException {
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(2048);
        return keyPairGenerator.genKeyPair();
    }

    // 将生成好的 key 的字节数组写成 Base64 并保存到文件（PEM格式）中
    public static void writeKeyToFile(Path path, byte[] keyBytes, String header, String footer) throws IOException {
        StringBuilder pem = new StringBuilder();
        pem.append(header).append('\n')
                .append(Base64.getMimeEncoder(64, "\n".getBytes())
                        .encodeToString(keyBytes))
                .append('\n')
                .append(footer)
                .append('\n');
        Files.createDirectories(path.getParent());
        Files.writeString(path, pem.toString());
    }

    // 从文件中读取PEM格式的密钥
    public static String readKeyFromFile(Path path) throws IOException {
        return Files.readString(path, StandardCharsets.UTF_8);
    }

    // 公钥加密
    public static String encrypt(String plainText, PublicKey publickey) throws Exception {
        Cipher cipher = Cipher.getInstance("RSA");
        cipher.init(Cipher.ENCRYPT_MODE, publickey);
        byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(cipherText);
    }

    // 私钥解密
    public static String decrypt(String cipherText, PrivateKey privateKey) throws Exception {
        Cipher cipher = Cipher.getInstance("RSA");
        cipher.init(Cipher.DECRYPT_MODE, privateKey);
        byte[] plainText = cipher.doFinal(Base64.getDecoder().decode(cipherText));
        return new String(plainText, StandardCharsets.UTF_8);
    }

    // 从 PEM 加载公钥
    public static PublicKey loadPublicKey(String pem) throws Exception {
        String publicKeyPEM = pem.replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s+", "");
        byte[] encoded = Base64.getDecoder().decode(publicKeyPEM);
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(encoded);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return kf.generatePublic(keySpec);
    }

    // 从 PEM 加载私钥
    public static PrivateKey loadPrivateKey(String pem) throws Exception {
        String privateKeyPEM = pem.replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s+", "");
        byte[] encoded = Base64.getDecoder().decode(privateKeyPEM);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(encoded);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return kf.generatePrivate(keySpec);
    }

    // 生成并保存公钥和私钥到 key 目录
    public static void generateAndSaveKeyPair() throws Exception {
        // 获取项目根目录路径
        Path classPath = Path.of(RSAKeyUtils.class.getProtectionDomain().getCodeSource().getLocation().toURI());
        // target/classes/上两级是项目根目录
        Path projectRoot = classPath.getParent().getParent();
        Path keyDir = projectRoot
                .resolve("src")
                .resolve("main")
                .resolve("resources")
                .resolve("key");

        System.out.println("生成密钥目录：" + keyDir.toAbsolutePath());

        KeyPair keyPair = generateKeyPair();
        writeKeyToFile(keyDir.resolve("public_key.pem"),keyPair.getPublic().getEncoded(),
                "-----BEGIN PUBLIC KEY-----", "-----END PUBLIC KEY-----");
        writeKeyToFile(keyDir.resolve("private_key.pem"), keyPair.getPrivate().getEncoded(),
                "-----BEGIN PRIVATE KEY-----", "-----END PRIVATE KEY-----");
    }

    @PostConstruct
    public void init() {
        try {
            Path classPath = Path.of(RSAKeyUtils.class.getProtectionDomain().getCodeSource().getLocation().toURI());
            Path projectRoot = classPath.getParent().getParent();
            Path keyDir = projectRoot
                    .resolve("src")
                    .resolve("main")
                    .resolve("resources")
                    .resolve("key");

            Path privateKeyPath = keyDir.resolve("private_key.pem");
            Path publicKeyPath = keyDir.resolve("public_key.pem");

            // 如果密钥文件不存在，自动生成
            if (!Files.exists(privateKeyPath) || !Files.exists(publicKeyPath)) {
                System.out.println("密钥文件不存在，开始生成...");
                generateAndSaveKeyPair();
                System.out.println("密钥生成完毕！");
            }

            // 读取私钥文件
            String pem = readKeyFromFile(privateKeyPath);
            this.privateKey = loadPrivateKey(pem);

            // 读取公钥文件
            pem = readKeyFromFile(publicKeyPath);
            this.publicKey = loadPublicKey(pem);

        } catch (Exception e) {
            e.printStackTrace();
            throw new IllegalStateException("初始化RSA私钥失败", e);
        }
    }

    // 解密
    public String decrypt(String cipherText) {
        try {
            return decrypt(cipherText, privateKey);
        } catch (Exception e) {
            throw new RuntimeException("解密失败", e);
        }
    }

    public String getPublicKeyBase64() {
        if (publicKey == null) {
            throw new IllegalStateException("公钥未初始化");
        }
        return Base64.getEncoder().encodeToString(publicKey.getEncoded());
    }
}
