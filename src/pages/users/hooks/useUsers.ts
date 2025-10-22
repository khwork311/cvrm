import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import usersApi, { CreateUserData, UpdateUserData, UserFilters } from '../api';

// Get all users
export const useUsers = (filters?: UserFilters) => {
  return useSWR(['users', filters], () => usersApi.getAll(filters));
};

// Get single user
export const useUser = (id: number) => {
  return useSWR([`users`, id], () => usersApi.getById(id));
};

// Create user
export const useCreateUser = () => {
  return useSWRMutation('users', (_, { arg }: { arg: CreateUserData }) => usersApi.create(arg));
};

// Update user
export const useUpdateUser = () => {
  return useSWRMutation('users', (_, { arg }: { arg: { id: number; data: UpdateUserData } }) =>
    usersApi.update(arg.id, arg.data)
  );
};

// Toggle user status
export const useToggleUserStatus = () => {
  return useSWRMutation('users/status', (_, { arg }: { arg: { id: number; status: number } }) =>
    usersApi.toggleStatus(arg)
  );
};
