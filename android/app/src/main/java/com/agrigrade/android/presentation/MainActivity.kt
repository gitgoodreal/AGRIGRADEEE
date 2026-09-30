package com.agrigrade.android.presentation

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.*
import com.agrigrade.android.presentation.theme.AgriGradeTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AgriGradeTheme {
                MainAppScaffold()
            }
        }
    }
}

sealed class Screen(val route: String, val title: String) {
    object Dashboard : Screen("dashboard", "Dashboard")
    object Inspect : Screen("inspect", "Inspect")
    object Batches : Screen("batches", "Batches")
    object Analytics : Screen("analytics", "Analytics")
    object Reports : Screen("reports", "Reports")
    object Review : Screen("review/{inspectionId}", "Human Review")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScaffold() {
    val navController = rememberNavController()
    var selectedItem by remember { mutableStateOf(0) }
    val items = listOf("Dashboard", "Inspect", "Batches", "Analytics", "Reports")
    val icons = listOf(
        Icons.Default.Home,
        Icons.Default.CameraAlt,
        Icons.Default.Inventory2,
        Icons.Default.BarChart,
        Icons.Default.Description
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AgriGrade Potato QA", style = MaterialTheme.typography.titleMedium) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        bottomBar = {
            NavigationBar {
                items.forEachIndexed { index, item ->
                    NavigationBarItem(
                        icon = { Icon(icons[index], contentDescription = item) },
                        label = { Text(item) },
                        selected = selectedItem == index,
                        onClick = {
                            selectedItem = index
                            val route = when (index) {
                                0 -> Screen.Dashboard.route
                                1 -> Screen.Inspect.route
                                2 -> Screen.Batches.route
                                3 -> Screen.Analytics.route
                                4 -> Screen.Reports.route
                                else -> Screen.Dashboard.route
                            }
                            navController.navigate(route) {
                                popUpTo(Screen.Dashboard.route) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Dashboard.route,
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            composable(Screen.Dashboard.route) {
                // Dashboard Composable
            }
            composable(Screen.Inspect.route) {
                // Inspect Composable with CameraX & Gallery picker
            }
            composable(Screen.Batches.route) {
                // Batches Composable
            }
            composable(Screen.Analytics.route) {
                // Analytics Composable
            }
            composable(Screen.Reports.route) {
                // Reports Composable
            }
            composable(Screen.Review.route) { backStackEntry ->
                val inspectionId = backStackEntry.arguments?.getString("inspectionId")
                // Human Review Composable
            }
        }
    }
}
