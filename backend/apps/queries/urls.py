from django.urls import path
from .views import NetworkGraphView, ShortestPathView, IntroductionFinderView, CQLFilterView

urlpatterns = [
    path('network-graph/', NetworkGraphView.as_view(), name='network-graph'),
    path('shortest-path/', ShortestPathView.as_view(), name='shortest-path'),
    path('introduction-finder/', IntroductionFinderView.as_view(), name='introduction-finder'),
    path('cql/filter/', CQLFilterView.as_view(), name='cql-filter'),
    path('cql/validate/', CQLFilterView.as_view(), name='cql-validate'),
]
