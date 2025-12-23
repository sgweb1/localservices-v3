<?php

namespace Tests\Unit\Helpers;

use App\Helpers\MediaHelper;
use Tests\TestCase;

class MediaHelperTest extends TestCase
{
    /**
     * Test obliczania shardów
     */
    public function test_get_shard_calculation(): void
    {
        // Test różnych ID
        $this->assertEquals('001', MediaHelper::getShard(1));
        $this->assertEquals('000', MediaHelper::getShard(1000));
        $this->assertEquals('456', MediaHelper::getShard(123456));
        $this->assertEquals('999', MediaHelper::getShard(999));
        $this->assertEquals('000', MediaHelper::getShard(2000));
        $this->assertEquals('789', MediaHelper::getShard(789));
        
        // Test równomiernego rozłożenia
        $this->assertEquals('042', MediaHelper::getShard(1042));
        $this->assertEquals('042', MediaHelper::getShard(2042));
    }

    /**
     * Test generowania ścieżek shardowanych
     */
    public function test_get_sharded_path(): void
    {
        // Bez subpath
        $this->assertEquals(
            'avatars/456/123456',
            MediaHelper::getShardedPath('avatars', 123456)
        );
        
        // Z subpath
        $this->assertEquals(
            'providers/789/789/portfolio',
            MediaHelper::getShardedPath('providers', 789, 'portfolio')
        );
        
        // Service gallery
        $this->assertEquals(
            'services/000/5000/gallery',
            MediaHelper::getShardedPath('services', 5000, 'gallery')
        );
        
        // Review
        $this->assertEquals(
            'reviews/042/10042',
            MediaHelper::getShardedPath('reviews', 10042)
        );
    }

    /**
     * Test dozwolonych typów MIME
     */
    public function test_allowed_mimes(): void
    {
        $avatarMimes = MediaHelper::getAllowedMimes('avatar');
        $this->assertContains('jpeg', $avatarMimes);
        $this->assertContains('png', $avatarMimes);
        $this->assertContains('webp', $avatarMimes);
        
        $documentMimes = MediaHelper::getAllowedMimes('document');
        $this->assertContains('pdf', $documentMimes);
    }

    /**
     * Test maksymalnych rozmiarów
     */
    public function test_max_sizes(): void
    {
        $this->assertEquals(5120, MediaHelper::getMaxSize('avatar'));
        $this->assertEquals(10240, MediaHelper::getMaxSize('portfolio'));
        $this->assertEquals(5120, MediaHelper::getMaxSize('review'));
    }

    /**
     * Test rozkładu shardów (statystyka)
     */
    public function test_shard_distribution(): void
    {
        $distribution = [];
        
        // Symuluj 10000 użytkowników
        for ($i = 1; $i <= 10000; $i++) {
            $shard = MediaHelper::getShard($i);
            $distribution[$shard] = ($distribution[$shard] ?? 0) + 1;
        }
        
        // Każdy shard powinien mieć 10 użytkowników (10000 / 1000 = 10)
        foreach ($distribution as $shard => $count) {
            $this->assertEquals(10, $count, "Shard {$shard} has {$count} users, expected 10");
        }
        
        // Powinno być dokładnie 1000 shardów
        $this->assertCount(1000, $distribution);
    }
}
