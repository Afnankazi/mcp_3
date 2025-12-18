def add(x, y):
    """Adds two numbers."""
    return x + y

def subtract(x, y):
    """Subtracts y from x."""
    return x - y

def multiply(x, y):
    """Multiplies two numbers."""
    return x * y

def divide(x, y):
    """Divides x by y, handles division by zero."""
    if y == 0:
        raise ZeroDivisionError("Cannot divide by zero!")
    return x / y

def get_number_input(prompt):
    """Prompts user for a number and validates input."""
    while True:
        try:
            return float(input(prompt))
        except ValueError:
            print("Invalid input. Please enter a numeric value.")

def display_menu():
    """Displays the calculator operation menu."""
    print("\n--- Simple Calculator ---")
    print("1. Add")
    print("2. Subtract")
    print("3. Multiply")
    print("4. Divide")
    print("5. Exit")
    print("-------------------------")

def main():
    """Main function to run the calculator application."""
    while True:
        display_menu()
        choice = input("Enter your choice (1-5): ")

        if choice == '5':
            print("Exiting calculator. Goodbye!")
            break

        if choice in ('1', '2', '3', '4'):
            try:
                num1 = get_number_input("Enter first number: ")
                num2 = get_number_input("Enter second number: ")

                if choice == '1':
                    result = add(num1, num2)
                    print(f"Result: {num1} + {num2} = {result}")
                elif choice == '2':
                    result = subtract(num1, num2)
                    print(f"Result: {num1} - {num2} = {result}")
                elif choice == '3':
                    result = multiply(num1, num2)
                    print(f"Result: {num1} * {num2} = {result}")
                elif choice == '4':
                    try:
                        result = divide(num1, num2)
                        print(f"Result: {num1} / {num2} = {result}")
                    except ZeroDivisionError as e:
                        print(f"Error: {e}")
            except Exception as e:
                # Catch any unexpected errors during number input or calculation
                print(f"An unexpected error occurred: {e}")
        else:
            print("Invalid choice. Please enter a number between 1 and 5.")

if __name__ == "__main__":
    main()
