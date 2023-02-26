namespace BlogLab.Models.Blog
{
    public class Blog: BlogCreate
    {
        public string? Username { get; set; }

        public int ApplicationUserId { get; set; }

        public DateTime PublishedDate { get; set; }

        public DateTime UpdateDate { get; set; }
    }
}
