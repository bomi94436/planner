import { createSwaggerSpec } from 'next-swagger-doc'

type Schemas = NonNullable<
  NonNullable<
    NonNullable<Parameters<typeof createSwaggerSpec>[0]>['definition']['components']
  >['schemas']
>

export const schemas: Schemas = {
  Task: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      title: { type: 'string' },
      completed: { type: 'boolean' },
      startTimestamp: { type: 'string', format: 'date-time' },
      endTimestamp: { type: 'string', format: 'date-time' },
      isAllDay: { type: 'boolean' },
      planId: { type: 'integer', nullable: true },
      executionId: { type: 'integer', nullable: true },
    },
  },
  CreateTaskBody: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      startTimestamp: { type: 'string', format: 'date-time' },
      endTimestamp: { type: 'string', format: 'date-time' },
      isAllDay: { type: 'boolean' },
    },
  },
  UpdateTaskBody: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      completed: { type: 'boolean' },
      startTimestamp: { type: 'string', format: 'date-time' },
      endTimestamp: { type: 'string', format: 'date-time' },
      isAllDay: { type: 'boolean' },
    },
  },
  Execution: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      startTimestamp: { type: 'string', format: 'date-time' },
      endTimestamp: { type: 'string', format: 'date-time' },
      title: { type: 'string' },
      color: { type: 'string' },
    },
  },
  CreateExecutionBody: {
    type: 'object',
    properties: {
      startTimestamp: { type: 'string', format: 'date-time' },
      endTimestamp: { type: 'string', format: 'date-time' },
      title: { type: 'string' },
      color: { type: 'string' },
    },
  },
  UpdateExecutionBody: {
    type: 'object',
    properties: {
      startTimestamp: { type: 'string', format: 'date-time' },
      endTimestamp: { type: 'string', format: 'date-time' },
      title: { type: 'string' },
      color: { type: 'string' },
      taskIds: { type: 'array', items: { type: 'integer' } },
    },
  },
  Plan: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      startTimestamp: { type: 'string', format: 'date-time' },
      endTimestamp: { type: 'string', format: 'date-time' },
      title: { type: 'string' },
      color: { type: 'string' },
    },
  },
  CreatePlanBody: {
    type: 'object',
    properties: {
      startTimestamp: { type: 'string', format: 'date-time' },
      endTimestamp: { type: 'string', format: 'date-time' },
      title: { type: 'string' },
      color: { type: 'string' },
    },
  },
  UpdatePlanBody: {
    type: 'object',
    properties: {
      startTimestamp: { type: 'string', format: 'date-time' },
      endTimestamp: { type: 'string', format: 'date-time' },
      title: { type: 'string' },
      color: { type: 'string' },
      taskIds: { type: 'array', items: { type: 'integer' } },
    },
  },
}
