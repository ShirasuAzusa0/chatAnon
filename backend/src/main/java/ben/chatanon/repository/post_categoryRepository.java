package ben.chatanon.repository;

import ben.chatanon.entity.entity_post.post_category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface post_categoryRepository extends JpaRepository<post_category, Integer> {
}
