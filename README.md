# Social CRM

A modern, relationship-focused Customer Relationship Management system designed to help you maintain and strengthen your personal and professional network.

## Features

### People Management
- **Comprehensive Profiles**: Track detailed information about people including occupation, industry, location, lifestyle traits, and ambition levels
- **Relationship Tracking**: Monitor relationship strength and connection quality
- **Contact Frequency Management**: Set preferred contact intervals and track last contact dates
- **Next Contact Scheduling**: Automatically calculates when to reach out next based on contact frequency
- **Smart Sorting**: Sort your contacts by next contact date to prioritize outreach

### Network Visualization
- **Interactive Network Graph**: Visualize your entire network and how people connect to each other
- **Relationship Mapping**: See the strength and type of connections between people
- **Graph Analytics**: Powered by Neo4j for advanced graph queries and insights

### Contact Organization
- **Tags & Labels**: Categorize contacts with custom tags
- **Ambition Tracking**: Track people's ambition levels and indicators
- **Lifestyle Profiling**: Understand lifestyle types (traditional, bohemian, luxury, minimalist)
- **Advanced Filtering**: Filter by ambition level, location, or search by name/occupation/industry

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **TanStack Query** (React Query) for data fetching and caching
- **React Router** for navigation
- **Axios** for API communication

### Backend
- **Django 5.0** with Django REST Framework
- **Python 3.11**
- **PostgreSQL 16** for relational data storage
- **Neo4j 5.13** with Graph Data Science plugin for network graph storage

### Infrastructure
- **Docker** and **Docker Compose** for containerization
- **Nginx** (production-ready configuration included)

## Getting Started

### Prerequisites
- Docker and Docker Compose installed on your system
- Git (for cloning the repository)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/socialcrm.git
   cd socialcrm
   ```

2. **Start the services**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database on port 5433
   - Neo4j database on ports 7474 (HTTP) and 7687 (Bolt)
   - Django backend on port 8001
   - React frontend on port 3001

3. **Run database migrations**
   ```bash
   docker exec socialcrm-backend python manage.py migrate
   ```

4. **Create a superuser (optional)**
   ```bash
   docker exec -it socialcrm-backend python manage.py createsuperuser
   ```

5. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:8001/api
   - Neo4j Browser: http://localhost:7474
   - Django Admin: http://localhost:8001/admin

### Environment Variables

The application uses the following default environment variables (configured in `docker-compose.yml`):

**Backend:**
- `DATABASE_URL`: PostgreSQL connection string
- `NEO4J_BOLT_URL`: Neo4j Bolt connection URL
- `NEO4J_USERNAME`: Neo4j username (default: neo4j)
- `NEO4J_PASSWORD`: Neo4j password (default: socialcrm123)
- `DJANGO_DEBUG`: Debug mode (default: True)

**Frontend:**
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:8001)

For production deployment, create a `.env` file and update these values accordingly.

## API Documentation

### People Endpoints

#### List All People
```
GET /api/people/
```

#### Get Person Details
```
GET /api/people/{id}/
```

#### Create New Person
```
POST /api/people/
Content-Type: application/json

{
  "name": "John Doe",
  "occupation": "Software Engineer",
  "industry": "Technology",
  "location": "San Francisco, USA",
  "ambition_level": "high",
  "relationship_strength": 4,
  "preferred_contact_frequency": 30,
  "last_contact_date": "2026-10-01"
}
```

#### Update Person
```
PATCH /api/people/{id}/
Content-Type: application/json

{
  "last_contact_date": "2026-10-10",
  "next_contact_date": "2026-11-09"
}
```

#### Delete Person
```
DELETE /api/people/{id}/
```

### Relationship Endpoints

#### List All Relationships
```
GET /api/relationships/
```

#### Create Relationship
```
POST /api/relationships/
Content-Type: application/json

{
  "from_person": "person-uuid-1",
  "to_person": "person-uuid-2",
  "relationship_type": "professional",
  "strength": 4,
  "context": "Met at a conference"
}
```

### Network Graph Endpoint

#### Get Network Graph Data
```
GET /api/queries/network-graph/?limit=500
```

Returns nodes and edges for network visualization.

### Choices Endpoint

#### Get Available Choices
```
GET /api/choices/
```

Returns all available options for dropdowns (lifestyle types, ambition levels, etc.).

## Key Features in Detail

### Automatic Next Contact Calculation

The system automatically calculates the next contact date based on:
- **Last Contact Date**: When you last spoke with the person
- **Preferred Contact Frequency**: How often you want to stay in touch (in days)

Formula: `next_contact_date = last_contact_date + preferred_contact_frequency`

You can also manually override the calculated date if needed.

### Visual Indicators

- **Overdue Contacts**: Displayed in red when the next contact date has passed
- **Upcoming Contacts**: Displayed in green/normal color
- **Relationship Strength**: Shown as star ratings (1-5 stars)

### Sorting and Filtering

- Sort by name or next contact date (ascending/descending)
- Filter by ambition level
- Filter by location
- Search by name, occupation, or industry

## Database Schema

### PostgreSQL (Relational Data)

**Person Model:**
- Basic info: name, age, location, nationality
- Professional: occupation, industry, company
- Lifestyle: lifestyle_type, lifestyle_traits
- Ambition: ambition_level, ambition_indicators
- Relationship: relationship_strength, preferred_contact_frequency
- Contact tracking: last_contact_date, next_contact_date
- Metadata: tags, notes, created_at, updated_at

**Relationship Model:**
- from_person, to_person (foreign keys)
- relationship_type: acquaintance, friend, family, professional, mentor
- strength (1-5)
- context, since, status
- Timestamps

### Neo4j (Graph Database)

**Person Nodes:**
- Stores person data for graph visualization
- Properties mirror PostgreSQL schema

**KNOWS Relationships:**
- Connects Person nodes
- Properties: strength, type
- Enables network analysis and visualization

## Development

### Project Structure

```
SocialCRM/
├── backend/                 # Django backend
│   ├── apps/
│   │   ├── people/         # People app (models, views, serializers)
│   │   ├── queries/        # Query endpoints (network graph)
│   │   └── relationships/  # Relationships app
│   ├── config/             # Django settings
│   ├── services/           # External services (Neo4j)
│   ├── manage.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/               # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── Dockerfile
│   └── package.json
│
└── docker-compose.yml      # Docker orchestration
```

### Running Tests

Backend tests:
```bash
docker exec socialcrm-backend python manage.py test
```

### Making Changes

1. **Backend changes**: Edit files in `./backend`, changes are hot-reloaded
2. **Frontend changes**: Edit files in `./frontend`, changes are hot-reloaded
3. **Database migrations**: 
   ```bash
   docker exec socialcrm-backend python manage.py makemigrations
   docker exec socialcrm-backend python manage.py migrate
   ```

## Deployment

### Production Considerations

1. **Environment Variables**: Use proper secrets management
2. **Database**: Use managed PostgreSQL and Neo4j services
3. **Static Files**: Configure Django to serve static files properly
4. **CORS**: Update CORS settings in Django settings
5. **HTTPS**: Configure SSL/TLS certificates
6. **Debug Mode**: Set `DJANGO_DEBUG=False`

### Docker Production Build

Build production images:
```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Acknowledgments

- Built with Django and React
- Network visualization powered by Neo4j
- UI inspired by modern CRM best practices
