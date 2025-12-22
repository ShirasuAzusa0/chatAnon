package ben.chatanon.repository;

import ben.chatanon.entity.entity_chat.Models;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModelRepository extends JpaRepository<Models, Integer> {
    Models findByModelId(int modelId);

    Models findByModelName(String modelName);
}
