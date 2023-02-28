using BlogLab.Models.Photo;

namespace BlogLab.Repository
{
    public interface IPhotoRepository
    {
        Task<Photo> InsertAsync(PhotoCreate photoCreate, int applicationUserId);

        Task<Photo> GetAsync(int photoId);
        
        Task<List<Photo>> GetAllByUserIdAsync(int applicationUserId);
        
        Task<int> DeleteAsync(int photoId);
    }
}
