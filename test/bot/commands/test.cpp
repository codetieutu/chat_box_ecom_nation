#include <iostream>
using namespace std;

int main()
{
    int a[5][5];

    for (int i = 0; i < 5; i++)
    {

        for (int j = 0; j < 5; j++)
        {
            cout << a[i][j] << " ";
            cout << "\n";
        }
    }
}