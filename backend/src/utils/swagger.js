const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'FinFlow API',
    version: '1.0.0',
    description: '## Finance Data Processing and Access Control Backend\n\nA complete backend for managing financial records with role-based access control.\n\n### Roles\n- **Admin** – Full access: manage users, transactions, categories\n- **Analyst** – Read all + create/update transactions  \n- **Viewer** – Read-only access to own data\n\n### Test Accounts\n| Role | Email | Password |\n|------|-------|----------|\n| Admin | admin@finflow.com | admin123 |\n| Analyst | sarah@finflow.com | password123 |\n| Viewer | john@finflow.com | password123 |',
    contact: { name: 'FinFlow Support' }
  },
  servers: [
    { url: '/api', description: 'Current Environment (Auto-select)' },
    { url: 'http://localhost:3001/api', description: 'Local Development' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' }, name: { type: 'string' }, email: { type: 'string' },
          role: { type: 'string', enum: ['viewer', 'analyst', 'admin'] },
          status: { type: 'string', enum: ['active', 'inactive'] },
          avatar: { type: 'string' }, created_at: { type: 'string' }
        }
      },
      Transaction: {
        type: 'object',
        properties: {
          id: { type: 'string' }, user_id: { type: 'string' },
          amount: { type: 'number' }, type: { type: 'string', enum: ['income', 'expense'] },
          category: { type: 'string' }, description: { type: 'string' },
          date: { type: 'string', format: 'date' }, tags: { type: 'string' },
          created_at: { type: 'string' }
        }
      },
      Error: { type: 'object', properties: { success: { type: 'boolean', example: false }, error: { type: 'string' } } },
      Success: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string' } } }
    }
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Auth', description: 'Authentication & profile management' },
    { name: 'Dashboard', description: 'Summary analytics and insights' },
    { name: 'Transactions', description: 'Financial records CRUD' },
    { name: 'Users', description: 'User management (Admin only)' },
    { name: 'Notifications', description: 'User notifications' },
    { name: 'Categories', description: 'Transaction categories' },
    { name: 'Audit', description: 'Audit trail (Admin only)' }
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'], summary: 'Register new user', security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object', required: ['name','email','password'],
            properties: {
              name: { type: 'string', example: 'Jane Doe' },
              email: { type: 'string', example: 'jane@example.com' },
              password: { type: 'string', example: 'secret123' },
              role: { type: 'string', enum: ['viewer','analyst','admin'], example: 'viewer' }
            }
          }}}
        },
        responses: {
          201: { description: 'Registered successfully' },
          409: { description: 'Email already exists' },
          422: { description: 'Validation error' }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'], summary: 'Login and get JWT token', security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object', required: ['email','password'],
            properties: {
              email: { type: 'string', example: 'admin@finflow.com' },
              password: { type: 'string', example: 'admin123' }
            }
          }}}
        },
        responses: { 200: { description: 'Login success with token' }, 401: { description: 'Invalid credentials' } }
      }
    },
    '/auth/me': {
      get: { tags: ['Auth'], summary: 'Get current user profile', responses: { 200: { description: 'User profile' } } }
    },
    '/auth/profile': {
      put: {
        tags: ['Auth'], summary: 'Update own profile',
        requestBody: {
          content: { 'application/json': { schema: {
            type: 'object',
            properties: { name: { type: 'string' }, avatar: { type: 'string' } }
          }}}
        },
        responses: { 200: { description: 'Profile updated' } }
      }
    },
    '/auth/password': {
      put: {
        tags: ['Auth'], summary: 'Change password',
        requestBody: {
          content: { 'application/json': { schema: {
            type: 'object', required: ['currentPassword','newPassword'],
            properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string' } }
          }}}
        },
        responses: { 200: { description: 'Password changed' }, 400: { description: 'Wrong current password' } }
      }
    },
    '/dashboard/summary': {
      get: {
        tags: ['Dashboard'], summary: 'Get full dashboard summary',
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'userId', in: 'query', schema: { type: 'string' }, description: 'Admin only: filter by user' }
        ],
        responses: { 200: { description: 'Dashboard summary with totals, trends, and recent activity' } }
      }
    },
    '/dashboard/analytics': {
      get: {
        tags: ['Dashboard'], summary: 'Advanced analytics (Analyst/Admin)',
        responses: { 200: { description: 'Month-over-month, day patterns, income sources' } }
      }
    },
    '/transactions': {
      get: {
        tags: ['Transactions'], summary: 'List transactions with filtering & pagination',
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['income','expense'] } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['date','amount','category','created_at'] } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc','desc'] } }
        ],
        responses: { 200: { description: 'Paginated list of transactions' } }
      },
      post: {
        tags: ['Transactions'], summary: 'Create transaction (Analyst/Admin)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object', required: ['amount','type','category','date'],
            properties: {
              amount: { type: 'number', example: 5000 },
              type: { type: 'string', enum: ['income','expense'], example: 'income' },
              category: { type: 'string', example: 'Salary' },
              description: { type: 'string', example: 'Monthly pay' },
              date: { type: 'string', format: 'date', example: '2024-01-15' },
              tags: { type: 'array', items: { type: 'string' } }
            }
          }}}
        },
        responses: { 201: { description: 'Transaction created' }, 422: { description: 'Validation error' } }
      }
    },
    '/transactions/{id}': {
      get: {
        tags: ['Transactions'], summary: 'Get single transaction',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Transaction detail' }, 404: { description: 'Not found' } }
      },
      put: {
        tags: ['Transactions'], summary: 'Update transaction (Analyst/Admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: { 'application/json': { schema: {
            type: 'object',
            properties: {
              amount: { type: 'number' }, type: { type: 'string' },
              category: { type: 'string' }, description: { type: 'string' }, date: { type: 'string' }
            }
          }}}
        },
        responses: { 200: { description: 'Updated' }, 403: { description: 'Forbidden' } }
      },
      delete: {
        tags: ['Transactions'], summary: 'Soft-delete transaction (Admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted (soft)' }, 403: { description: 'Forbidden' } }
      }
    },
    '/users': {
      get: {
        tags: ['Users'], summary: 'List all users (Admin)',
        parameters: [
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['viewer','analyst','admin'] } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active','inactive'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'User list' }, 403: { description: 'Admin only' } }
      }
    },
    '/users/stats': {
      get: { tags: ['Users'], summary: 'User statistics (Admin)', responses: { 200: { description: 'Role/status breakdown' } } }
    },
    '/users/{id}': {
      get: {
        tags: ['Users'], summary: 'Get user by ID (Admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'User detail' } }
      },
      put: {
        tags: ['Users'], summary: 'Update user (Admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: { 'application/json': { schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              role: { type: 'string', enum: ['viewer','analyst','admin'] },
              status: { type: 'string', enum: ['active','inactive'] }
            }
          }}}
        },
        responses: { 200: { description: 'Updated' } }
      },
      delete: {
        tags: ['Users'], summary: 'Delete user (Admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } }
      }
    },
    '/notifications': {
      get: {
        tags: ['Notifications'], summary: 'Get notifications',
        parameters: [{ name: 'unread', in: 'query', schema: { type: 'boolean' } }],
        responses: { 200: { description: 'Notifications list with unread count' } }
      }
    },
    '/notifications/read-all': {
      put: { tags: ['Notifications'], summary: 'Mark all as read', responses: { 200: { description: 'All marked read' } } }
    },
    '/notifications/broadcast': {
      post: {
        tags: ['Notifications'], summary: 'Broadcast notification (Admin)',
        requestBody: {
          content: { 'application/json': { schema: {
            type: 'object', required: ['title','message'],
            properties: {
              title: { type: 'string' }, message: { type: 'string' },
              type: { type: 'string', enum: ['info','success','warning','error'] },
              targetRole: { type: 'string', enum: ['viewer','analyst','admin'] }
            }
          }}}
        },
        responses: { 200: { description: 'Broadcasted' } }
      }
    },
    '/notifications/{id}/read': {
      put: {
        tags: ['Notifications'], summary: 'Mark notification as read',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Marked read' } }
      }
    },
    '/notifications/{id}': {
      delete: {
        tags: ['Notifications'], summary: 'Delete notification',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } }
      }
    },
    '/categories': {
      get: {
        tags: ['Categories'], summary: 'List categories',
        parameters: [{ name: 'type', in: 'query', schema: { type: 'string', enum: ['income','expense'] } }],
        responses: { 200: { description: 'Categories list' } }
      },
      post: {
        tags: ['Categories'], summary: 'Create category (Admin)',
        requestBody: {
          content: { 'application/json': { schema: {
            type: 'object', required: ['name','type'],
            properties: {
              name: { type: 'string' }, type: { type: 'string', enum: ['income','expense','both'] },
              color: { type: 'string', example: '#10b981' }, icon: { type: 'string', example: '💰' }
            }
          }}}
        },
        responses: { 201: { description: 'Created' }, 409: { description: 'Already exists' } }
      }
    },
    '/categories/{id}': {
      delete: {
        tags: ['Categories'], summary: 'Delete category (Admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } }
      }
    },
    '/audit-logs': {
      get: {
        tags: ['Audit'], summary: 'Get audit trail (Admin)',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Audit logs' } }
      }
    },
    '/health': {
      get: {
        tags: [], summary: 'Health check', security: [],
        responses: { 200: { description: 'API status and uptime' } }
      }
    }
  }
};

module.exports = swaggerSpec;
