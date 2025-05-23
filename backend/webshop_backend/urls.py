from django.contrib import admin
from django.urls import path, include
from api.views import landing_page_view, populate_db_view # Import these HTML-serving views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # All API endpoints prefixed with /api/

    # Project-level URLs for Django-served HTML pages
    path('', landing_page_view, name='landing-page'),
    path('populate-db/', populate_db_view, name='populate-db'), # POST request expected for this
]