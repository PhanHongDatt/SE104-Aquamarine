export interface FormResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export interface BaseFormProps {
  isLoading?: boolean;
}
