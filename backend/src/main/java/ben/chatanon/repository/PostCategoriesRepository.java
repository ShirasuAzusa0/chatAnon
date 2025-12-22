package ben.chatanon.repository;

import ben.chatanon.entity.entity_post.PostCategories;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostCategoriesRepository extends JpaRepository<PostCategories, Integer> {
}
