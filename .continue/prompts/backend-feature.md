# Backend Feature Implementation

## Process

1. **Define API Contract**
   - Create Resource class defining response structure
   - Create DTO if input data needed
   - Document endpoint: method, path, required fields

2. **Create Service**
   - Implement business logic
   - Type all parameters and returns
   - Handle validation and errors
   - Throw meaningful exceptions

3. **Build Controller**
   - Keep under 15 lines
   - Call service method
   - Return Resource or error response
   - No business logic here

4. **Database Changes (if needed)**
   - Create migration
   - Use `up()` and `down()` methods
   - Add indexes for frequently queried fields

## Code Template

**Service (app/Services/YourService.php)**
```php
class YourService
{
    public function __construct(private YourRepository $repo) {}
    
    public function create(CreateYourDTO $dto): YourResource
    {
        // Business logic here
        $data = $this->repo->create($dto->toArray());
        return new YourResource($data);
    }
}
```

**Controller (app/Http/Controllers/Api/V1/YourController.php)**
```php
class YourController extends Controller
{
    public function store(StoreYourRequest $request, YourService $service)
    {
        return $service->create(CreateYourDTO::from($request->validated()));
    }
}
```

## Checklist

- [ ] API contract documented (endpoint, params, response)
- [ ] DTO created with validation
- [ ] Service class implements business logic
- [ ] Controller thin and delegating
- [ ] Resource defines response structure
- [ ] Error cases handled with exceptions
- [ ] Type hints on all parameters and returns
- [ ] No raw SQL queries
- [ ] Tests pass locally
