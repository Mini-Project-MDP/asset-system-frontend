// Generouted, changes to this file will be overridden
/* eslint-disable */

import { components, hooks, utils } from '@generouted/react-router/client'

export type Path =
  | `/`
  | `/approvals`
  | `/approvals/:id`
  | `/fulfillment`
  | `/fulfillment/:id`
  | `/requests`
  | `/requests/:id`
  | `/requests/new`
  | `/settings`

export type Params = {
  '/approvals/:id': { id: string }
  '/fulfillment/:id': { id: string }
  '/requests/:id': { id: string }
}

export type ModalPath = never

export const { Link, Navigate } = components<Path, Params>()
export const { useModals, useNavigate, useParams } = hooks<Path, Params, ModalPath>()
export const { redirect } = utils<Path, Params>()
