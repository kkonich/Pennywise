using Microsoft.AspNetCore.Mvc;
using Pennywise.Application.Interfaces;
using Pennywise.Contracts.Categories;
using Pennywise.Domain.Entities;

namespace Pennywise.Controllers;

/// <summary>
/// API endpoints for managing categories.
/// </summary>
[ApiController]
[Route("api/categories")]
public sealed class CategoriesController : ControllerBase
{
    private readonly ICategoryRepository _repository;

    /// <summary>
    /// Initializes a new instance of the <see cref="CategoriesController"/> class.
    /// </summary>
    /// <param name="repository">Category repository.</param>
    public CategoriesController(ICategoryRepository repository)
    {
        _repository = repository;
    }

    /// <summary>
    /// Returns all categories sorted by sort order, then name.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var categories = await _repository.GetAllAsync(cancellationToken);
        var response = categories.Select(MapToResponse).ToList();
        return Ok(response);
    }

    /// <summary>
    /// Returns a single category by its id.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CategoryResponse>> Get(Guid id, CancellationToken cancellationToken)
    {
        var category = await _repository.GetAsync(id, cancellationToken);
        if (category is null)
        {
            return NotFound();
        }

        return Ok(MapToResponse(category));
    }

    /// <summary>
    /// Creates a new category.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CategoryResponse>> Create(CategoryCreateRequest request, CancellationToken cancellationToken)
    {
        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Type = request.Type,
            SortOrder = request.SortOrder,
            IsArchived = request.IsArchived ?? false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _repository.AddAsync(category, cancellationToken);

        var response = MapToResponse(category);
        return CreatedAtAction(nameof(Get), new { id = category.Id }, response);
    }

    /// <summary>
    /// Updates an existing category.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, CategoryUpdateRequest request, CancellationToken cancellationToken)
    {
        var category = await _repository.GetAsync(id, cancellationToken);
        if (category is null)
        {
            return NotFound();
        }

        category.Name = request.Name;
        category.Type = request.Type;
        category.SortOrder = request.SortOrder;
        category.IsArchived = request.IsArchived;

        await _repository.UpdateAsync(category, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Deletes a category by its id.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var category = await _repository.GetAsync(id, cancellationToken);
        if (category is null)
        {
            return NotFound();
        }

        await _repository.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    private static CategoryResponse MapToResponse(Category category)
    {
        return new CategoryResponse
        {
            Id = category.Id,
            Name = category.Name,
            Type = category.Type,
            SortOrder = category.SortOrder,
            IsArchived = category.IsArchived,
            CreatedAt = category.CreatedAt
        };
    }
}
